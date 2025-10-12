#!/bin/bash

# Deployment script for News Aggregator
# Supports deployment to various platforms

set -e

PLATFORM=${1:-"local"}
ENV=${2:-"production"}

echo "🚀 Deploying News Aggregator to $PLATFORM ($ENV environment)..."

# Build and prepare for deployment
echo "📦 Preparing deployment..."

# Install production dependencies
npm ci --only=production

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p dist
cp -r src dist/
cp package.json dist/
cp package-lock.json dist/
cp .env.example dist/

# Platform-specific deployment
case $PLATFORM in
    "heroku")
        echo "🔧 Deploying to Heroku..."
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        # Create Procfile
        echo "web: node src/index.js server" > Procfile
        
        # Deploy
        git add .
        git commit -m "Deploy to Heroku" || true
        heroku create startup-news-aggregator-$(date +%s) || true
        git push heroku main
        
        echo "✅ Deployed to Heroku"
        ;;
        
    "railway")
        echo "🚂 Deploying to Railway..."
        
        # Create railway.json
        cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node src/index.js server",
    "healthcheckPath": "/health"
  }
}
EOF
        
        echo "✅ Railway configuration created. Push to Railway Git repository."
        ;;
        
    "vercel")
        echo "▲ Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
            exit 1
        fi
        
        # Create vercel.json
        cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
        
        vercel --prod
        echo "✅ Deployed to Vercel"
        ;;
        
    "docker")
        echo "🐳 Building Docker image..."
        
        # Create Dockerfile
        cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create data and logs directories
RUN mkdir -p data logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "src/index.js", "server"]
EOF
        
        # Build image
        docker build -t startup-news-aggregator .
        
        echo "✅ Docker image built: startup-news-aggregator"
        echo "Run with: docker run -p 3000:3000 startup-news-aggregator"
        ;;
        
    "pm2")
        echo "⚡ Setting up PM2 deployment..."
        
        # Install PM2 if not present
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'news-aggregator',
    script: 'src/index.js',
    args: 'server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
        
        # Start with PM2
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
        
        echo "✅ Deployed with PM2"
        echo "Manage with: pm2 status, pm2 logs, pm2 restart news-aggregator"
        ;;
        
    "local")
        echo "🏠 Setting up local production environment..."
        
        # Set production environment
        export NODE_ENV=production
        
        # Start the server
        echo "Starting server in production mode..."
        node src/index.js server &
        
        # Wait for server to start
        sleep 5
        
        # Test health endpoint
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo "✅ Server started successfully at http://localhost:3000"
        else
            echo "❌ Server failed to start"
            exit 1
        fi
        ;;
        
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Supported platforms: heroku, railway, vercel, docker, pm2, local"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Environment: $ENV"
echo "Platform: $PLATFORM"
echo ""
echo "API Endpoints:"
echo "  GET  /api/news     - Get latest news"
echo "  GET  /api/stats    - Get statistics"
echo "  POST /api/fetch    - Trigger fetch"
echo "  GET  /health       - Health check"
echo ""
echo "Don't forget to set environment variables:"
echo "  NEWSAPI_KEY, MEDIASTACK_KEY, GUARDIAN_API_KEY"