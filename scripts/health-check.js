#!/usr/bin/env node

const http = require('http');
const https = require('https');

const services = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'User Service', url: 'http://localhost:3001/health' },
  { name: 'Job Service', url: 'http://localhost:3002/health' },
  { name: 'Funding Service', url: 'http://localhost:3003/health' },
  { name: 'Notification Service', url: 'http://localhost:3004/health' },
  { name: 'News Aggregator', url: 'http://localhost:3005/health' },
];

const checkService = (service) => {
  return new Promise((resolve) => {
    const client = service.url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const req = client.get(service.url, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            name: service.name,
            status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            data: parsed,
          });
        } catch (error) {
          resolve({
            name: service.name,
            status: 'unhealthy',
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            error: 'Invalid JSON response',
          });
        }
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        name: service.name,
        status: 'unhealthy',
        statusCode: 0,
        responseTime: `${responseTime}ms`,
        error: error.message,
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      resolve({
        name: service.name,
        status: 'unhealthy',
        statusCode: 0,
        responseTime: `${responseTime}ms`,
        error: 'Request timeout',
      });
    });
  });
};

const formatStatus = (status) => {
  const colors = {
    healthy: '\x1b[32m✓\x1b[0m',
    unhealthy: '\x1b[31m✗\x1b[0m',
  };
  return colors[status] || status;
};

const main = async () => {
  console.log('🏥 StartupCompass Platform Health Check\n');
  console.log('Checking all services...\n');
  
  const results = await Promise.all(services.map(checkService));
  
  let allHealthy = true;
  
  results.forEach((result) => {
    const statusIcon = formatStatus(result.status);
    console.log(`${statusIcon} ${result.name.padEnd(20)} ${result.status.padEnd(10)} ${result.responseTime.padEnd(8)} (${result.statusCode})`);
    
    if (result.status !== 'healthy') {
      allHealthy = false;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    if (result.data && result.data.services) {
      Object.entries(result.data.services).forEach(([serviceName, serviceStatus]) => {
        const serviceIcon = formatStatus(serviceStatus);
        console.log(`   ${serviceIcon} ${serviceName}: ${serviceStatus}`);
      });
    }
    
    console.log('');
  });
  
  console.log('─'.repeat(60));
  
  if (allHealthy) {
    console.log('🎉 All services are healthy!');
    process.exit(0);
  } else {
    console.log('⚠️  Some services are unhealthy. Check the logs for more details.');
    process.exit(1);
  }
};

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: npm run health [options]

Options:
  --help, -h     Show this help message
  --json         Output results in JSON format
  --quiet        Only show unhealthy services

Examples:
  npm run health
  npm run health -- --json
  npm run health -- --quiet
  `);
  process.exit(0);
}

if (args.includes('--json')) {
  // JSON output mode
  const main = async () => {
    const results = await Promise.all(services.map(checkService));
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy',
      services: results,
    }, null, 2));
  };
  main().catch(console.error);
} else if (args.includes('--quiet')) {
  // Quiet mode - only show unhealthy services
  const main = async () => {
    const results = await Promise.all(services.map(checkService));
    const unhealthy = results.filter(r => r.status !== 'healthy');
    
    if (unhealthy.length === 0) {
      console.log('✓ All services are healthy');
      process.exit(0);
    } else {
      console.log(`⚠️  ${unhealthy.length} unhealthy service(s):`);
      unhealthy.forEach((result) => {
        console.log(`✗ ${result.name}: ${result.error || 'unhealthy'}`);
      });
      process.exit(1);
    }
  };
  main().catch(console.error);
} else {
  // Default mode
  main().catch(console.error);
}