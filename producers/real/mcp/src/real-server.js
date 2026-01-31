/**
 * Real MCP Server for Evidence Capture
 * 
 * Minimal MCP server with deterministic tool for REAL execution evidence
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const server = new Server({
    name: 'mplp-weather-server',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {}
    }
});

// Register get_weather tool
server.setRequestHandler('tools/list', async () => {
    return {
        tools: [{
            name: 'get_weather',
            description: 'Get current weather for a location (deterministic test data)',
            inputSchema: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'City name'
                    }
                },
                required: ['location']
            }
        }]
    };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name === 'get_weather') {
        const location = request.params.arguments?.location || 'Unknown';

        // Deterministic response (same input → same output)
        const weatherData = {
            'San Francisco': { temperature: 72, conditions: 'sunny', humidity: 65 },
            'New York': { temperature: 58, conditions: 'cloudy', humidity: 75 },
            'London': { temperature: 55, conditions: 'rainy', humidity: 85 }
        };

        const data = weatherData[location] || { temperature: 70, conditions: 'unknown', humidity: 50 };

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    location,
                    ...data,
                    timestamp: new Date().toISOString(),
                    source: 'deterministic_test_data'
                })
            }]
        };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport).catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});
