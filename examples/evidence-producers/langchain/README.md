# LangChain Evidence Producer

## Usage
Run with Node.js.

## Prerequisites
- Node.js >= 20
- LangChain API Key (or fake provider)

## Execution
Run `node run.js` to generate evidence packs.

## Expected Artifacts
- `verdict.json`
- `pack/trace/events.ndjson`

## Verification
Confirm events match the LangChain trace format.

<a name="repro-steps"></a>
### Reproducibility Steps
1. Install dependencies: `npm install`
2. Run producer: `node run.js`
3. Verify output in `data/runs/`
