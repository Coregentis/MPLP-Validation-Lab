import os
import json

def create_run(run_id, is_pass):
    print(f"Creating run: {run_id}")
    
    # Paths
    public_runs_root = "/Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/public/data/runs"
    curated_runs_root = "/Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/data/runs"
    
    run_public_dir = os.path.join(public_runs_root, run_id)
    run_curated_dir = os.path.join(curated_runs_root, run_id)
    
    os.makedirs(os.path.join(run_public_dir, "pack/timeline"), exist_ok=True)
    os.makedirs(os.path.join(run_public_dir, "pack/snapshots"), exist_ok=True)
    os.makedirs(run_curated_dir, exist_ok=True)
    
    # 1. public/data/runs/<id>/bundle.manifest.json
    bundle_manifest = {
        "run_id": run_id,
        "pack_root": "pack",
        "ruleset_ref": "ruleset-1.2",
        "generated_at": "2026-01-25T12:00:00.000Z"
    }
    with open(os.path.join(run_public_dir, "bundle.manifest.json"), "w") as f:
        json.dump(bundle_manifest, f, indent=2)
        
    # 2. public/data/runs/<id>/evidence_pointers.json
    evidence_pointers = {
        "schema_version": "1.1",
        "canonptr_version": "v1",
        "pointers": [
            {
                "requirement_id": "RQ-D1-01",
                "artifact_path": "pack/timeline/events.ndjson",
                "locator": f"canonptr:v1:D1:budget:000:{run_id[:8]}",
                "status": "PRESENT"
            }
        ]
    }
    with open(os.path.join(run_public_dir, "evidence_pointers.json"), "w") as f:
        json.dump(evidence_pointers, f, indent=2)
        
    # 3. public/data/runs/<id>/pack/manifest.json
    pack_manifest = {
        "schema_version": "2.0.0",
        "substrate": "pydantic-ai",
        "run_id": run_id,
        "timeline": "timeline/events.ndjson",
        "snapshots": "snapshots/"
    }
    with open(os.path.join(run_public_dir, "pack/manifest.json"), "w") as f:
        json.dump(pack_manifest, f, indent=2)
        
    # 4. public/data/runs/<id>/pack/timeline/events.ndjson
    outcome = "allow" if is_pass else "invalid_outcome"
    events = [
        {"event_type": "agent.init", "event_id": f"evt-{run_id}-000", "timestamp": "2026-01-25T12:00:00.000Z"},
        {"event_type": "budget.decision", "decision_kind": "budget", "outcome": outcome, "resource": "llm-tokens", "amount": 1000, "event_id": f"evt-{run_id}-001", "timestamp": "2026-01-25T12:00:01.000Z"},
        {"event_type": "lifecycle.transition", "to_state": "success", "event_id": f"evt-{run_id}-002", "timestamp": "2026-01-25T12:00:02.000Z"},
        {"event_type": "agent.end", "event_id": f"evt-{run_id}-003", "timestamp": "2026-01-25T12:00:03.000Z"}
    ]
    with open(os.path.join(run_public_dir, "pack/timeline/events.ndjson"), "w") as f:
        for event in events:
            f.write(json.dumps(event) + "\n")
            
    # 5. data/runs/<id>/input.pointer.json
    input_pointer = {
        "pack_path": f"public/data/runs/{run_id}",
        "pack_layout": "1.0",
        "notes": f"Pydantic-AI Substrate - v0.13 Extension Line ({'PASS' if is_pass else 'FAIL'})"
    }
    with open(os.path.join(run_curated_dir, "input.pointer.json"), "w") as f:
        json.dump(input_pointer, f, indent=2)

runs = [
    ("pydantic-ai-d1-budget-pass-01", True),
    ("pydantic-ai-d1-budget-pass-02", True),
    ("pydantic-ai-d1-budget-fail-01", False),
    ("pydantic-ai-d1-budget-fail-02", False),
]

for run_id, is_pass in runs:
    create_run(run_id, is_pass)
