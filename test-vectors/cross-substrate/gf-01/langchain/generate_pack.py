#!/usr/bin/env python3
"""
LangChain Pack Generator (Official Substrate)
Scenario: gf-01 - Single Agent Plan Cross-substrate Equivalence

Uses:
- langchain==0.2.16
- langchain-community==0.2.16
- FakeListLLM for deterministic output

Determinism Locks:
- Fixed timestamp: 2026-01-01T00:00:00Z
- Seeded UUID: uuid5(NAMESPACE, scenario_id)
- Sorted JSON output
"""

import json
import hashlib
import os
import uuid
from datetime import datetime

# Determinism constants
FIXED_TIMESTAMP = "2026-01-01T00:00:00Z"
SCENARIO_ID = "gf-01-single-agent-lifecycle"
NAMESPACE = uuid.UUID("12345678-1234-5678-1234-567812345678")

def seeded_uuid(name: str) -> str:
    """Generate deterministic UUID from name."""
    return str(uuid.uuid5(NAMESPACE, name))

def write_json(path: str, data: dict):
    """Write JSON with sorted keys for determinism."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")

def generate_context():
    """Generate context.json using LangChain patterns."""
    from langchain_community.llms.fake import FakeListLLM
    
    # Use FakeListLLM for deterministic response
    llm = FakeListLLM(responses=["Summarize: Plan a simple multi-step task"])
    summary = llm.invoke("What is the task?")
    
    return {
        "context_id": seeded_uuid(f"{SCENARIO_ID}-context"),
        "created_at": FIXED_TIMESTAMP,
        "project_id": seeded_uuid(f"{SCENARIO_ID}-project"),
        "requirements": {
            "summary": str(summary).strip()
        }
    }

def generate_plan(context_id: str):
    """Generate plan.json with 3+ steps using LangChain."""
    from langchain_community.llms.fake import FakeListLLM
    
    # FakeListLLM with deterministic plan steps
    llm = FakeListLLM(responses=[
        "Step 1: Initialize task environment",
        "Step 2: Process input data",
        "Step 3: Generate output results"
    ])
    
    steps = []
    for i in range(3):
        step_response = llm.invoke(f"Generate step {i+1}")
        steps.append({
            "step_id": seeded_uuid(f"{SCENARIO_ID}-step-{i}"),
            "description": str(step_response).strip(),
            "status": "completed"
        })
    
    return {
        "approach": "Deterministic single-agent planning",
        "context_ref": context_id,
        "created_at": FIXED_TIMESTAMP,
        "plan_id": seeded_uuid(f"{SCENARIO_ID}-plan"),
        "steps": steps
    }

def generate_trace(context_id: str, plan_id: str):
    """Generate trace.json with execution events."""
    return {
        "created_at": FIXED_TIMESTAMP,
        "events": [
            {
                "event_id": seeded_uuid(f"{SCENARIO_ID}-event-0"),
                "event_type": "plan_created",
                "plan_ref": plan_id,
                "timestamp": FIXED_TIMESTAMP
            },
            {
                "context_ref": context_id,
                "event_id": seeded_uuid(f"{SCENARIO_ID}-event-1"),
                "event_type": "execution_started",
                "timestamp": FIXED_TIMESTAMP
            },
            {
                "event_id": seeded_uuid(f"{SCENARIO_ID}-event-2"),
                "event_type": "execution_completed",
                "plan_ref": plan_id,
                "timestamp": FIXED_TIMESTAMP
            }
        ],
        "trace_id": seeded_uuid(f"{SCENARIO_ID}-trace")
    }

def generate_manifest():
    """Generate pack manifest."""
    return {
        "created_at": FIXED_TIMESTAMP,
        "generator": {
            "name": "langchain-official-pack-generator",
            "version": "0.2.0"
        },
        "pack_id": seeded_uuid(f"{SCENARIO_ID}-langchain-pack"),
        "protocol_version": "1.0.0",
        "scenario_id": SCENARIO_ID,
        "substrate": {
            "deterministic_mode": "FakeListLLM",
            "packages": ["langchain==0.2.16", "langchain-community==0.2.16"],
            "python_version": "3.9+",
            "type": "langchain",
            "version": "0.2.16"
        }
    }

def generate_sha256sums(pack_dir: str):
    """Generate sha256sums.txt for integrity verification."""
    files_to_hash = []
    for root, dirs, files in os.walk(pack_dir):
        for f in sorted(files):
            if f == "sha256sums.txt":
                continue
            filepath = os.path.join(root, f)
            relpath = os.path.relpath(filepath, pack_dir)
            files_to_hash.append((relpath, filepath))
    
    files_to_hash.sort(key=lambda x: x[0])
    
    lines = []
    for relpath, filepath in files_to_hash:
        with open(filepath, "rb") as f:
            h = hashlib.sha256(f.read()).hexdigest()
        lines.append(f"{h}  {relpath}")
    
    os.makedirs(os.path.join(pack_dir, "integrity"), exist_ok=True)
    sums_path = os.path.join(pack_dir, "integrity", "sha256sums.txt")
    with open(sums_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    
    return sums_path

def main():
    pack_dir = "pack"
    
    print("=== LangChain Official Pack Generator (gf-01) ===\n")
    
    # Generate artifacts
    context = generate_context()
    write_json(f"{pack_dir}/artifacts/context.json", context)
    print(f"✓ Generated context.json (context_id: {context['context_id'][:8]}...)")
    
    plan = generate_plan(context["context_id"])
    write_json(f"{pack_dir}/artifacts/plan.json", plan)
    print(f"✓ Generated plan.json (plan_id: {plan['plan_id'][:8]}..., {len(plan['steps'])} steps)")
    
    trace = generate_trace(context["context_id"], plan["plan_id"])
    write_json(f"{pack_dir}/artifacts/trace.json", trace)
    print(f"✓ Generated trace.json (trace_id: {trace['trace_id'][:8]}..., {len(trace['events'])} events)")
    
    # Generate manifest
    manifest = generate_manifest()
    write_json(f"{pack_dir}/manifest.json", manifest)
    print(f"✓ Generated manifest.json (scenario_id: {manifest['scenario_id']})")
    
    # Generate timeline (NDJSON)
    os.makedirs(f"{pack_dir}/timeline", exist_ok=True)
    with open(f"{pack_dir}/timeline/events.ndjson", "w") as f:
        for event in trace["events"]:
            f.write(json.dumps(event, sort_keys=True) + "\n")
    print(f"✓ Generated timeline/events.ndjson")
    
    # Generate integrity hashes
    sums_path = generate_sha256sums(pack_dir)
    print(f"✓ Generated integrity/sha256sums.txt")
    
    # Calculate pack_root_hash
    with open(sums_path, "rb") as f:
        pack_root_hash = hashlib.sha256(f.read()).hexdigest()
    print(f"\n✅ Pack generated successfully!")
    print(f"   pack_root_hash: {pack_root_hash}")

if __name__ == "__main__":
    main()
