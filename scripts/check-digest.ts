import * as crypto from 'crypto';

function computeSemanticDigest(fields: any): string {
    const sortedKeys = Object.keys(fields).sort();
    const canonical = sortedKeys
        .filter(k => fields[k] !== undefined)
        .map(k => `${k}:${fields[k]}`)
        .join('|');

    const hash = crypto.createHash('sha256').update(canonical).digest('hex');
    console.log(`Canonical: ${canonical}`);
    console.log(`Hash: ${hash}`);
    return hash.slice(0, 8);
}

const fields = {
    decision_kind: "budget",
    outcome: "allow",
    resource: "mcp-tool-quota",
    amount: 50
};

console.log(`Digest: ${computeSemanticDigest(fields)}`);
