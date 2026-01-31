/**
 * MCP D1 Scenario: Basic Pass
 * 
 * Minimal viable MCP interaction demonstrating:
 * - Tool registration
 * - Tool invocation
 * - Successful response
 */

interface Evidence {
    context: any;
    plan: any;
    confirm: any;
    trace: any;
    timeline: any[];
}

const scenario = {
    id: 'd1_basic_pass',
    name: 'D1: Basic Success',
    description: 'Basic MCP tool interaction with successful completion',

    execute(): Evidence {
        const now = new Date().toISOString();

        // Context establishment
        const context = {
            scenario_id: 'd1_basic_pass',
            protocol: 'MPLP',
            substrate: 'MCP',
            objective: 'Demonstrate basic MCP tool registration and invocation',
            established_at: now
        };

        // Planning phase
        const plan = {
            scenario_id: 'd1_basic_pass',
            steps: [
                {
                    step_id: 1,
                    action: 'register_tool',
                    tool_name: 'get_weather',
                    tool_schema: {
                        name: 'get_weather',
                        description: 'Get current weather for a location',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                location: { type: 'string', description: 'City name' }
                            },
                            required: ['location']
                        }
                    }
                },
                {
                    step_id: 2,
                    action: 'invoke_tool',
                    tool_name: 'get_weather',
                    input: { location: 'San Francisco' }
                }
            ],
            planned_at: now
        };

        // Confirmation
        const confirm = {
            scenario_id: 'd1_basic_pass',
            plan_approved: true,
            approved_at: now,
            approver: 'automated'
        };

        // Execution trace
        const trace = {
            scenario_id: 'd1_basic_pass',
            execution_start: now,
            execution_end: new Date(Date.now() + 1000).toISOString(),
            tool_invocations: [
                {
                    tool_name: 'get_weather',
                    input: { location: 'San Francisco' },
                    output: {
                        location: 'San Francisco',
                        temperature: 72,
                        conditions: 'sunny',
                        timestamp: now
                    },
                    status: 'success'
                }
            ],
            verdict: 'PASS'
        };

        // Timeline events
        const timeline = [
            {
                timestamp: now,
                event: 'RUN_STARTED',
                data: { scenario_id: 'd1_basic_pass' }
            },
            {
                timestamp: now,
                event: 'PROTOCOL_REF_RECORDED',
                data: { protocol: 'MPLP', version: 'v2' }
            },
            {
                timestamp: now,
                event: 'SUBSTRATE_REF_RECORDED',
                data: { substrate: 'MCP', version: 'v0.5.0' }
            },
            {
                timestamp: now,
                event: 'ARTIFACT_WRITTEN',
                data: { artifact: 'context.json' }
            },
            {
                timestamp: now,
                event: 'ARTIFACT_WRITTEN',
                data: { artifact: 'plan.json' }
            },
            {
                timestamp: now,
                event: 'ARTIFACT_WRITTEN',
                data: { artifact: 'confirm.json' }
            },
            {
                timestamp: now,
                event: 'TOOL_REGISTERED',
                data: { tool_name: 'get_weather' }
            },
            {
                timestamp: now,
                event: 'TOOL_INVOKED',
                data: { tool_name: 'get_weather', input: { location: 'San Francisco' } }
            },
            {
                timestamp: now,
                event: 'TOOL_COMPLETED',
                data: { tool_name: 'get_weather', status: 'success' }
            },
            {
                timestamp: now,
                event: 'ARTIFACT_WRITTEN',
                data: { artifact: 'trace.json' }
            },
            {
                timestamp: new Date(Date.now() + 1000).toISOString(),
                event: 'VERIFY_COMPLETED',
                data: { status: 'VERIFIED' }
            },
            {
                timestamp: new Date(Date.now() + 1000).toISOString(),
                event: 'RUN_COMPLETED',
                data: { verdict: 'PASS' }
            }
        ];

        return {
            context,
            plan,
            confirm,
            trace,
            timeline
        };
    }
};

export default scenario;
