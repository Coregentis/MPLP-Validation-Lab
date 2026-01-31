/**
 * Gate Runner Library
 * 
 * Provides types and utilities for running gates.
 * Used by all V2 gates and the unified gate runner.
 * 
 * Ticket: P1-03
 */

export type GateExit = 0 | 1 | 2; // 0=PASS, 1=FAIL, 2=WARN

export interface GateResult {
    gate_id: string;
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details?: string[];
    exit_code?: GateExit;
    summary?: string;  // V2 style uses 'summary' instead of 'message'
    failures?: any[];  // V2 style uses 'failures' array
}

export interface GateFailure {
    message: string;
    details?: string[];
}

export interface GateDefinition {
    id?: string;
    gate_id?: string;
    name: string;
    description?: string;
    run?(): Promise<GateResult>;
    execute?(): Promise<GateResult>;
}

export interface Gate {
    id: string;
    name: string;
    description?: string;
    run(): Promise<GateResult>;
}

/**
 * Helper to create a PASS result
 */
/**
 * Helper to create a PASS result (Supports V1 and V2 signatures)
 * V1: pass(message, details?)
 * V2: pass(gate_id, name, message, details?)
 */
export function pass(arg1: string, arg2?: string | string[], arg3?: string, arg4?: any[]): GateResult {
    // Check for V2 signature: pass(id, name, message, details?)
    if (typeof arg2 === 'string') {
        return {
            gate_id: arg1,
            name: arg2,
            status: 'PASS',
            message: arg3 || '',
            details: Array.isArray(arg4) ? arg4.map(d => typeof d === 'string' ? d : JSON.stringify(d)) : [],
            failures: Array.isArray(arg4) ? arg4 : [],
            exit_code: 0
        };
    }
    // V1 signature: pass(message, details?)
    return {
        gate_id: '',
        name: '',
        status: 'PASS',
        message: arg1,
        details: Array.isArray(arg2) ? arg2 : [],
        exit_code: 0
    };
}

/**
 * Helper to create a FAIL result (Supports V1 and V2 signatures)
 * V1: fail(message, details?)
 * V2: fail(gate_id, name, message, details?)
 */
export function fail(arg1: string, arg2?: string | string[] | any[], arg3?: string, arg4?: any[]): GateResult {
    // Check for V2 signature: fail(id, name, message, details?)
    if (typeof arg2 === 'string') {
        return {
            gate_id: arg1,
            name: arg2,
            status: 'FAIL',
            message: arg3 || '',
            details: Array.isArray(arg4) ? arg4.map(d => typeof d === 'string' ? d : JSON.stringify(d)) : [],
            failures: Array.isArray(arg4) ? arg4 : [],
            exit_code: 1
        };
    }
    // V1 signature: fail(message, details?)
    return {
        gate_id: '',
        name: '',
        status: 'FAIL',
        message: arg1,
        details: Array.isArray(arg2) ? arg2 as string[] : [],
        exit_code: 1
    };
}

/**
 * Helper to create a WARN result (Supports V1 and V2 signatures)
 */
export function warn(arg1: string, arg2?: string | string[], arg3?: string, arg4?: any[]): GateResult {
    // Check for V2 signature: warn(id, name, message, details?)
    if (typeof arg2 === 'string') {
        return {
            gate_id: arg1,
            name: arg2,
            status: 'WARN',
            message: arg3 || '',
            details: Array.isArray(arg4) ? arg4.map(d => typeof d === 'string' ? d : JSON.stringify(d)) : [],
            failures: Array.isArray(arg4) ? arg4 : [],
            exit_code: 2
        };
    }
    // V1 signature: warn(message, details?)
    return {
        gate_id: '',
        name: '',
        status: 'WARN',
        message: arg1,
        details: Array.isArray(arg2) ? arg2 : [],
        exit_code: 2
    };
}

/**
 * Run a gate and return the result with timing
 * Supports both run() method (new style) and execute() method (V2 style)
 */
export async function runGate(gate: GateDefinition | Gate): Promise<GateResult> {
    const start = Date.now();

    // Get gate metadata (support both id and gate_id)
    const gateId = ('gate_id' in gate && gate.gate_id) || ('id' in gate && gate.id) || 'UNKNOWN';
    const gateName = gate.name || 'Unknown Gate';

    try {
        // Support both run() and execute() methods
        let result: GateResult;
        if ('run' in gate && typeof gate.run === 'function') {
            result = await gate.run();
        } else if ('execute' in gate && typeof gate.execute === 'function') {
            result = await gate.execute();
        } else {
            throw new Error('Gate has neither run() nor execute() method');
        }

        const duration = Date.now() - start;

        // Attach gate metadata
        result.gate_id = gateId;
        result.name = gateName;

        // Normalize V2 style results (exit_code -> status, summary -> message)
        if (!result.status && result.exit_code !== undefined) {
            result.status = result.exit_code === 0 ? 'PASS' : result.exit_code === 2 ? 'WARN' : 'FAIL';
        }
        if (!result.message && result.summary) {
            result.message = result.summary;
        }
        if (!result.exit_code) {
            result.exit_code = result.status === 'PASS' ? 0 : result.status === 'WARN' ? 2 : 1;
        }

        // Default message
        if (!result.message) {
            result.message = result.status;
        }

        // Log to stderr
        const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
        console.error(`${icon} ${gateId} (${duration}ms): ${result.message}`);

        if (result.status !== 'PASS' && result.details && result.details.length > 0) {
            result.details.slice(0, 5).forEach(d => console.error(`   → ${d}`));
        }

        // Convert V2 failures array to details if present
        if (result.status !== 'PASS' && result.failures && result.failures.length > 0 && (!result.details || result.details.length === 0)) {
            result.failures.slice(0, 5).forEach((f: any) => {
                console.error(`   → ${f.message || JSON.stringify(f)}`);
            });
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        const message = error instanceof Error ? error.message : String(error);

        console.error(`❌ ${gateId} (${duration}ms): EXCEPTION - ${message}`);

        return {
            gate_id: gateId,
            name: gateName,
            status: 'FAIL',
            message: `Gate threw exception: ${message}`,
            details: [],
            exit_code: 1
        };
    }
}
