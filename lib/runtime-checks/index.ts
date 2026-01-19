/**
 * lib/runtime-checks/index.ts
 * 
 * Central export for all runtime checks.
 * This is the NEW canonical location (replacing lib/gates/).
 */

// Re-export all gate modules
export * from './gate-02-admission';
export * from './gate-03-determinism';
export * from './gate-04-language';
export * from './gate-05-no-exec-hosting';
export * from './gate-06-robots-policy';
export * from './gate-07-pii-leak';
export * from './gate-08-curated-immutability';
export * from './gate-09-ssot-projection';
export * from './gate-10-curated-invariants';
export * from './gate-11-reverify-required';
export * from './gate-12-export-consistency';
export * from './gate-14-adjudication-consistency';
export * from './gate-15-curated-adjudication-required';
export * from './gate-v02-g2-bundle-closure';
export * from './reason_codes';
