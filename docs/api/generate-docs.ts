import fs from 'fs';
import path from 'path';
import { specs } from './swagger-config';

interface APIEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: any[];
  requestBody?: any;
  responses: any;
  security?: any[];
}

interface APIDocumentation {
  info: any;
  servers: any[];
  endpoints: APIEndpoint[];
  schemas: any;
  totalEndpoints: number;
  endpointsByTag: Record<string, number>;
}

export class APIDocumentationGenerator {
  private specs: any;
  private outputDir: string;

  constructor(specs: any, outputDir: string = './docs/generated') {
    this.specs = specs;
    this.outputDir = outputDir;
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  public generateAll(): void {
    console.log('🔄 Generating API documentation...');
    
    const documentation = this.extractDocumentation();
    
    // Generate different formats
    this.generateMarkdown(documentation);
    this.generateHTML(documentation);
    this.generatePostmanCollection();
    this.generateOpenAPISpec();
    this.generateSDKExamples();
    
    console.log('✅ API documentation generated successfully!');
    console.log(`📁 Output directory: ${this.outputDir}`);
  }

  private extractDocumentation(): APIDocumentation {
    const endpoints: APIEndpoint[] = [];
    const endpointsByTag: Record<string, number> = {};

    // Extract endpoints from paths
    for (const [pathKey, pathValue] of Object.entries(this.specs.paths || {})) {
      for (const [method, methodValue] of Object.entries(pathValue as any)) {
        if (typeof methodValue === 'object' && methodValue !== null) {
          const endpoint: APIEndpoint = {
            path: pathKey,
            method: method.toUpperCase(),
            summary: methodValue.summary || '',
            description: methodValue.description || '',
            tags: methodValue.tags || [],
            parameters: methodValue.parameters,
            requestBody: methodValue.requestBody,
            responses: methodValue.responses,
            security: methodValue.security
          };

          endpoints.push(endpoint);

          // Count endpoints by tag
          endpoint.tags.forEach(tag => {
            endpointsByTag[tag] = (endpointsByTag[tag] || 0) + 1;
          });
        }
      }
    }

    return {
      info: this.specs.info,
      servers: this.specs.servers,
      endpoints,
      schemas: this.specs.components?.schemas || {},
      totalEndpoints: endpoints.length,
      endpointsByTag
    };
  }

  private generateMarkdown(documentation: APIDocumentation): void {
    const filePath = path.join(this.outputDir, 'API.md');
    
    let markdown = `# ${documentation.info.title}\n\n`;
    markdown += `${documentation.info.description}\n\n`;
    markdown += `**Version:** ${documentation.info.version}\n\n`;
    
    // Table of contents
    markdown += `## Table of Contents\n\n`;
    const tags = Object.keys(documentation.endpointsByTag);
    tags.forEach(tag => {
      markdown += `- [${tag}](#${tag.toLowerCase().replace(/\s+/g, '-')})\n`;
    });
    markdown += `\n`;

    // Servers
    markdown += `## Servers\n\n`;
    documentation.servers.forEach(server => {
      markdown += `- **${server.description}**: ${server.url}\n`;
    });
    markdown += `\n`;

    // Authentication
    markdown += `## Authentication\n\n`;
    markdown += `This API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:\n\n`;
    markdown += `\`\`\`\nAuthorization: Bearer <your-jwt-token>\n\`\`\`\n\n`;

    // Endpoints by tag
    tags.forEach(tag => {
      markdown += `## ${tag}\n\n`;
      
      const tagEndpoints = documentation.endpoints.filter(e => e.tags.includes(tag));
      
      tagEndpoints.forEach(endpoint => {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
        markdown += `**Summary:** ${endpoint.summary}\n\n`;
        markdown += `${endpoint.description}\n\n`;
        
        // Parameters
        if (endpoint.parameters && endpoint.parameters.length > 0) {
          markdown += `**Parameters:**\n\n`;
          markdown += `| Name | Type | Required | Description |\n`;
          markdown += `|------|------|----------|-------------|\n`;
          
          endpoint.parameters.forEach(param => {
            const required = param.required ? 'Yes' : 'No';
            const type = param.schema?.type || 'string';
            markdown += `| ${param.name} | ${type} | ${required} | ${param.description || ''} |\n`;
          });
          markdown += `\n`;
        }

        // Request body
        if (endpoint.requestBody) {
          markdown += `**Request Body:**\n\n`;
          markdown += `\`\`\`json\n`;
          markdown += `${JSON.stringify(this.getExampleFromSchema(endpoint.requestBody), null, 2)}\n`;
          markdown += `\`\`\`\n\n`;
        }

        // Responses
        markdown += `**Responses:**\n\n`;
        Object.entries(endpoint.responses).forEach(([statusCode, response]: [string, any]) => {
          markdown += `- **${statusCode}**: ${response.description || ''}\n`;
        });
        markdown += `\n`;

        markdown += `---\n\n`;
      });
    });

    // Schemas
    markdown += `## Data Models\n\n`;
    Object.entries(documentation.schemas).forEach(([schemaName, schema]: [string, any]) => {
      markdown += `### ${schemaName}\n\n`;
      markdown += `${schema.description || ''}\n\n`;
      
      if (schema.properties) {
        markdown += `**Properties:**\n\n`;
        markdown += `| Property | Type | Required | Description |\n`;
        markdown += `|----------|------|----------|-------------|\n`;
        
        Object.entries(schema.properties).forEach(([propName, prop]: [string, any]) => {
          const required = schema.required?.includes(propName) ? 'Yes' : 'No';
          const type = prop.type || 'string';
          markdown += `| ${propName} | ${type} | ${required} | ${prop.description || ''} |\n`;
        });
        markdown += `\n`;
      }
    });

    fs.writeFileSync(filePath, markdown);
    console.log(`📝 Markdown documentation generated: ${filePath}`);
  }

  private generateHTML(documentation: APIDocumentation): void {
    const filePath = path.join(this.outputDir, 'api-docs.html');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentation.info.title} - API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
        }
        .endpoint {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            margin-bottom: 1rem;
            overflow: hidden;
        }
        .endpoint-header {
            background: #f8f9fa;
            padding: 1rem;
            border-bottom: 1px solid #e1e5e9;
        }
        .method {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.875rem;
            margin-right: 0.5rem;
        }
        .method.get { background: #d4edda; color: #155724; }
        .method.post { background: #d1ecf1; color: #0c5460; }
        .method.put { background: #fff3cd; color: #856404; }
        .method.delete { background: #f8d7da; color: #721c24; }
        .endpoint-body {
            padding: 1rem;
        }
        .schema {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 1rem;
            margin: 1rem 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 0.75rem;
            text-align: left;
        }
        th {
            background: #e9ecef;
            font-weight: 600;
        }
        .nav {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
        .nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .nav a {
            color: #495057;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .nav a:hover {
            background: #e9ecef;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #6c757d;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${documentation.info.title}</h1>
        <p>${documentation.info.description.split('\n')[0]}</p>
        <p><strong>Version:</strong> ${documentation.info.version}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${documentation.totalEndpoints}</div>
            <div class="stat-label">Total Endpoints</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Object.keys(documentation.endpointsByTag).length}</div>
            <div class="stat-label">Categories</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${Object.keys(documentation.schemas).length}</div>
            <div class="stat-label">Data Models</div>
        </div>
    </div>

    <nav class="nav">
        <ul>
            ${Object.keys(documentation.endpointsByTag).map(tag => 
                `<li><a href="#${tag.toLowerCase().replace(/\s+/g, '-')}">${tag} (${documentation.endpointsByTag[tag]})</a></li>`
            ).join('')}
        </ul>
    </nav>

    ${Object.keys(documentation.endpointsByTag).map(tag => {
        const tagEndpoints = documentation.endpoints.filter(e => e.tags.includes(tag));
        return `
            <section id="${tag.toLowerCase().replace(/\s+/g, '-')}">
                <h2>${tag}</h2>
                ${tagEndpoints.map(endpoint => `
                    <div class="endpoint">
                        <div class="endpoint-header">
                            <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                            <code>${endpoint.path}</code>
                            <h3 style="margin: 0.5rem 0 0 0;">${endpoint.summary}</h3>
                        </div>
                        <div class="endpoint-body">
                            <p>${endpoint.description}</p>
                            ${endpoint.parameters && endpoint.parameters.length > 0 ? `
                                <h4>Parameters</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Required</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${endpoint.parameters.map(param => `
                                            <tr>
                                                <td><code>${param.name}</code></td>
                                                <td>${param.schema?.type || 'string'}</td>
                                                <td>${param.required ? 'Yes' : 'No'}</td>
                                                <td>${param.description || ''}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : ''}
                            <h4>Responses</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Status Code</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(endpoint.responses).map(([code, response]: [string, any]) => `
                                        <tr>
                                            <td><code>${code}</code></td>
                                            <td>${response.description || ''}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}
            </section>
        `;
    }).join('')}

    <section id="schemas">
        <h2>Data Models</h2>
        ${Object.entries(documentation.schemas).map(([name, schema]: [string, any]) => `
            <div class="schema">
                <h3>${name}</h3>
                <p>${schema.description || ''}</p>
                ${schema.properties ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Type</th>
                                <th>Required</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(schema.properties).map(([propName, prop]: [string, any]) => `
                                <tr>
                                    <td><code>${propName}</code></td>
                                    <td>${prop.type || 'string'}</td>
                                    <td>${schema.required?.includes(propName) ? 'Yes' : 'No'}</td>
                                    <td>${prop.description || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}
            </div>
        `).join('')}
    </section>

    <script>
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>
    `;

    fs.writeFileSync(filePath, html);
    console.log(`🌐 HTML documentation generated: ${filePath}`);
  }

  private generatePostmanCollection(): void {
    const filePath = path.join(this.outputDir, 'postman-collection.json');
    
    const collection = {
      info: {
        name: this.specs.info.title,
        description: this.specs.info.description,
        version: this.specs.info.version,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      auth: {
        type: "bearer",
        bearer: [
          {
            key: "token",
            value: "{{authToken}}",
            type: "string"
          }
        ]
      },
      variable: [
        {
          key: "baseUrl",
          value: this.specs.servers[0]?.url || "http://localhost:3000",
          type: "string"
        },
        {
          key: "authToken",
          value: "",
          type: "string"
        }
      ],
      item: this.generatePostmanItems()
    };

    fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
    console.log(`📮 Postman collection generated: ${filePath}`);
  }

  private generatePostmanItems(): any[] {
    const items: any[] = [];
    const documentation = this.extractDocumentation();
    
    // Group by tags
    const groupedEndpoints = documentation.endpoints.reduce((acc, endpoint) => {
      endpoint.tags.forEach(tag => {
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(endpoint);
      });
      return acc;
    }, {} as Record<string, APIEndpoint[]>);

    Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
      const folderItem = {
        name: tag,
        item: endpoints.map(endpoint => ({
          name: endpoint.summary,
          request: {
            method: endpoint.method,
            header: [
              {
                key: "Content-Type",
                value: "application/json",
                type: "text"
              }
            ],
            url: {
              raw: `{{baseUrl}}${endpoint.path}`,
              host: ["{{baseUrl}}"],
              path: endpoint.path.split('/').filter(p => p)
            },
            body: endpoint.requestBody ? {
              mode: "raw",
              raw: JSON.stringify(this.getExampleFromSchema(endpoint.requestBody), null, 2)
            } : undefined
          },
          response: []
        }))
      };
      
      items.push(folderItem);
    });

    return items;
  }

  private generateOpenAPISpec(): void {
    const filePath = path.join(this.outputDir, 'openapi.json');
    fs.writeFileSync(filePath, JSON.stringify(this.specs, null, 2));
    console.log(`📋 OpenAPI specification generated: ${filePath}`);
  }

  private generateSDKExamples(): void {
    const documentation = this.extractDocumentation();
    
    // JavaScript/TypeScript examples
    this.generateJavaScriptExamples(documentation);
    
    // Python examples
    this.generatePythonExamples(documentation);
    
    // cURL examples
    this.generateCurlExamples(documentation);
  }

  private generateJavaScriptExamples(documentation: APIDocumentation): void {
    const filePath = path.join(this.outputDir, 'javascript-examples.md');
    
    let content = `# JavaScript/TypeScript SDK Examples\n\n`;
    content += `## Installation\n\n`;
    content += `\`\`\`bash\nnpm install axios\n\`\`\`\n\n`;
    content += `## Setup\n\n`;
    content += `\`\`\`javascript\nconst axios = require('axios');\n\n`;
    content += `const api = axios.create({\n`;
    content += `  baseURL: '${documentation.servers[0]?.url}',\n`;
    content += `  headers: {\n`;
    content += `    'Content-Type': 'application/json',\n`;
    content += `    'Authorization': 'Bearer YOUR_JWT_TOKEN'\n`;
    content += `  }\n`;
    content += `});\n\`\`\`\n\n`;

    // Generate examples for key endpoints
    const keyEndpoints = documentation.endpoints.filter(e => 
      ['POST', 'GET'].includes(e.method) && 
      ['Authentication', 'Users', 'Startups', 'Jobs'].includes(e.tags[0])
    ).slice(0, 10);

    keyEndpoints.forEach(endpoint => {
      content += `## ${endpoint.summary}\n\n`;
      content += `\`\`\`javascript\n`;
      
      if (endpoint.method === 'GET') {
        content += `const response = await api.get('${endpoint.path}');\n`;
        content += `console.log(response.data);\n`;
      } else if (endpoint.method === 'POST') {
        const example = this.getExampleFromSchema(endpoint.requestBody);
        content += `const data = ${JSON.stringify(example, null, 2)};\n`;
        content += `const response = await api.post('${endpoint.path}', data);\n`;
        content += `console.log(response.data);\n`;
      }
      
      content += `\`\`\`\n\n`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`📜 JavaScript examples generated: ${filePath}`);
  }

  private generatePythonExamples(documentation: APIDocumentation): void {
    const filePath = path.join(this.outputDir, 'python-examples.md');
    
    let content = `# Python SDK Examples\n\n`;
    content += `## Installation\n\n`;
    content += `\`\`\`bash\npip install requests\n\`\`\`\n\n`;
    content += `## Setup\n\n`;
    content += `\`\`\`python\nimport requests\nimport json\n\n`;
    content += `BASE_URL = '${documentation.servers[0]?.url}'\n`;
    content += `headers = {\n`;
    content += `    'Content-Type': 'application/json',\n`;
    content += `    'Authorization': 'Bearer YOUR_JWT_TOKEN'\n`;
    content += `}\n\`\`\`\n\n`;

    const keyEndpoints = documentation.endpoints.filter(e => 
      ['POST', 'GET'].includes(e.method) && 
      ['Authentication', 'Users', 'Startups', 'Jobs'].includes(e.tags[0])
    ).slice(0, 10);

    keyEndpoints.forEach(endpoint => {
      content += `## ${endpoint.summary}\n\n`;
      content += `\`\`\`python\n`;
      
      if (endpoint.method === 'GET') {
        content += `response = requests.get(f'{BASE_URL}${endpoint.path}', headers=headers)\n`;
        content += `data = response.json()\n`;
        content += `print(data)\n`;
      } else if (endpoint.method === 'POST') {
        const example = this.getExampleFromSchema(endpoint.requestBody);
        content += `data = ${JSON.stringify(example, null, 4).replace(/"/g, "'")}\n`;
        content += `response = requests.post(f'{BASE_URL}${endpoint.path}', json=data, headers=headers)\n`;
        content += `result = response.json()\n`;
        content += `print(result)\n`;
      }
      
      content += `\`\`\`\n\n`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`🐍 Python examples generated: ${filePath}`);
  }

  private generateCurlExamples(documentation: APIDocumentation): void {
    const filePath = path.join(this.outputDir, 'curl-examples.md');
    
    let content = `# cURL Examples\n\n`;
    
    const keyEndpoints = documentation.endpoints.filter(e => 
      ['POST', 'GET'].includes(e.method) && 
      ['Authentication', 'Users', 'Startups', 'Jobs'].includes(e.tags[0])
    ).slice(0, 10);

    keyEndpoints.forEach(endpoint => {
      content += `## ${endpoint.summary}\n\n`;
      content += `\`\`\`bash\n`;
      
      if (endpoint.method === 'GET') {
        content += `curl -X GET "${documentation.servers[0]?.url}${endpoint.path}" \\\n`;
        content += `  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n`;
        content += `  -H "Content-Type: application/json"\n`;
      } else if (endpoint.method === 'POST') {
        const example = this.getExampleFromSchema(endpoint.requestBody);
        content += `curl -X POST "${documentation.servers[0]?.url}${endpoint.path}" \\\n`;
        content += `  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\\n`;
        content += `  -H "Content-Type: application/json" \\\n`;
        content += `  -d '${JSON.stringify(example)}'\n`;
      }
      
      content += `\`\`\`\n\n`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`🌐 cURL examples generated: ${filePath}`);
  }

  private getExampleFromSchema(requestBody: any): any {
    if (!requestBody?.content?.['application/json']?.schema) {
      return {};
    }

    const schema = requestBody.content['application/json'].schema;
    return this.generateExampleFromSchema(schema);
  }

  private generateExampleFromSchema(schema: any): any {
    if (schema.example) {
      return schema.example;
    }

    if (schema.type === 'object' && schema.properties) {
      const example: any = {};
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        if (prop.example !== undefined) {
          example[key] = prop.example;
        } else if (prop.type === 'string') {
          example[key] = prop.format === 'email' ? 'user@example.com' : 'string';
        } else if (prop.type === 'integer') {
          example[key] = 123;
        } else if (prop.type === 'boolean') {
          example[key] = true;
        } else if (prop.type === 'array') {
          example[key] = [];
        }
      });
      return example;
    }

    return {};
  }
}

// Generate documentation
export const generateAPIDocumentation = (): void => {
  const generator = new APIDocumentationGenerator(specs);
  generator.generateAll();
};

// CLI usage
if (require.main === module) {
  generateAPIDocumentation();
}

export default APIDocumentationGenerator;