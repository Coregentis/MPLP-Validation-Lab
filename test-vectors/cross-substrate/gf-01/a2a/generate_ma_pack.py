#!/usr/bin/env python3
"""
A2A Multi-Agent Pack Generator (Official Substrate)
Scenario: gf-01-multi-agent-lifecycle

Uses pure Python for deterministic output (no external A2A calls)

Determinism Locks:
- Fixed timestamp: 2026-01-14T00:00:00Z
- Seeded UUID: uuid5(NAMESPACE, scenario_id)
- Sorted JSON output
- No absolute paths
"""

import json
import hashlib
import os
import sys
import argparse
import uuid

# Determinism constants
FIXED_TIMESTAMP = "2026-01-14T00:00:00Z"
SCENARIO_ID = "gf-01-multi-agent-lifecycle"
RUN_ID = "gf-01-ma-a2a-official-v0.7.2"
NAMESPACE = uuid.UUID("a2a00000-1234-5678-1234-567812345678")

# Agent definitions (A2A agent-to-agent pattern)
AGENTS = [
    {"agent_id": "agent_a", "role": "coordinator"},
    {"agent_id": "agent_b", "role": "executor"}
]

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
    """Generate context.json - A2A message pattern."""
    return {
        "context_id": seeded_uuid(f"{RUN_ID}-context"),
        "created_at": FIXED_TIMESTAMP,
        "created_by": "agent_a",
        "project_id": seeded_uuid(f"{RUN_ID}-project"),
        "requirements": {
            "agents_required": 2,
            "handoff_required": True,
            "summary": "Multi-agent lifecycle with A2A agent-to-agent message passing pattern"
        }
    }

def generate_plan(context_id: str):
    """Generate plan.json with A2A message steps."""
    steps = [
        {"action": "initialize_agent", "agent": "agent_a", "step_id": "1"},
        {"action": "create_task_message", "agent": "agent_a", "step_id": "2"},
        {"action": "send_to_agent_b", "agent": "agent_a", "step_id": "3"},
        {"action": "receive_message", "agent": "agent_b", "step_id": "4"},
        {"action": "process_task", "agent": "agent_b", "step_id": "5"},
        {"action": "send_result", "agent": "agent_b", "step_id": "6"}
    ]
    
    return {
        "approach": "Agent A creates task and sends to Agent B via A2A message",
        "context_ref": context_id,
        "created_at": FIXED_TIMESTAMP,
        "created_by": "agent_a",
        "plan_id": seeded_uuid(f"{RUN_ID}-plan"),
        "steps": steps
    }

def generate_trace(context_id: str, plan_id: str):
    """Generate trace.json with A2A execution summary."""
    return {
        "agent_summaries": [
            {"agent_id": "agent_a", "artifacts_created": ["context.json", "plan.json"], "events_count": 4},
            {"agent_id": "agent_b", "artifacts_created": ["trace.json"], "events_count": 4}
        ],
        "completed_by": "agent_b",
        "created_at": FIXED_TIMESTAMP,
        "execution_summary": {
            "handoffs": 1,
            "outcome": "success",
            "total_agents": 2,
            "total_events": 8
        },
        "plan_ref": plan_id,
        "trace_id": seeded_uuid(f"{RUN_ID}-trace")
    }

def generate_timeline_events(plan_id: str):
    """Generate timeline events (NDJSON format) - A2A message pattern."""
    events = [
        {"agent_id": "agent_a", "event_id": "evt-001", "role": "coordinator", "ts": FIXED_TIMESTAMP, "type": "agent.init"},
        {"agent_id": "agent_a", "artifact_ref": "artifacts/context.json", "artifact_type": "context", "event_id": "evt-002", "ts": FIXED_TIMESTAMP, "type": "artifact.create"},
        {"agent_id": "agent_a", "artifact_ref": "artifacts/plan.json", "artifact_type": "plan", "event_id": "evt-003", "ts": FIXED_TIMESTAMP, "type": "artifact.create"},
        {"agent_id": "agent_a", "context_ref": "artifacts/plan.json", "event_id": "evt-004", "from_agent": "agent_a", "payload": {"task": "process_request"}, "to_agent": "agent_b", "ts": FIXED_TIMESTAMP, "type": "handoff"},
        {"agent_id": "agent_b", "event_id": "evt-005", "received_from": "agent_a", "role": "executor", "ts": FIXED_TIMESTAMP, "type": "agent.init"},
        {"agent_id": "agent_b", "event_id": "evt-006", "task_ref": "process_request", "ts": FIXED_TIMESTAMP, "type": "task.start"},
        {"agent_id": "agent_b", "artifact_ref": "artifacts/trace.json", "artifact_type": "trace", "event_id": "evt-007", "ts": FIXED_TIMESTAMP, "type": "artifact.create"},
        {"agent_id": "agent_b", "event_id": "evt-008", "outcome": "success", "ts": FIXED_TIMESTAMP, "type": "agent.complete"}
    ]
    return events

def generate_manifest():
    """Generate pack manifest."""
    return {
        "created_at": FIXED_TIMESTAMP,
        "generator": {
            "name": "a2a-multi-agent-generator",
            "version": "0.7.2"
        },
        "multi_agent": {
            "agent_count": 2,
            "agents": AGENTS,
            "handoff_count": 1
        },
        "pack_id": RUN_ID,
        "protocol_version": "1.0.0",
        "scenario_id": SCENARIO_ID,
        "substrate": "a2a",
        "substrate_version": "0.2.1"
    }

def generate_sha256sums(pack_dir: str) -> str:
    """Generate sha256sums.txt for integrity verification."""
    files_to_hash = []
    for root, dirs, files in os.walk(pack_dir):
        for f in sorted(files):
            if f in ("sha256sums.txt", "pack_root_hash.txt"):
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
    parser = argparse.ArgumentParser(description="A2A Multi-Agent Pack Generator")
    parser.add_argument("--out", default="pack", help="Output directory for pack")
    args = parser.parse_args()
    
    pack_dir = args.out
    
    print(f"=== A2A Multi-Agent Pack Generator (v0.7.2) ===\n")
    print(f"Run ID: {RUN_ID}")
    print(f"Output: {pack_dir}\n")
    
    # Generate artifacts
    context = generate_context()
    write_json(f"{pack_dir}/artifacts/context.json", context)
    print(f"✓ Generated context.json (id: {context['context_id'][:8]}...)")
    
    plan = generate_plan(context["context_id"])
    write_json(f"{pack_dir}/artifacts/plan.json", plan)
    print(f"✓ Generated plan.json (id: {plan['plan_id'][:8]}..., {len(plan['steps'])} steps)")
    
    trace = generate_trace(context["context_id"], plan["plan_id"])
    write_json(f"{pack_dir}/artifacts/trace.json", trace)
    print(f"✓ Generated trace.json (id: {trace['trace_id'][:8]}...)")
    
    # Generate manifest
    manifest = generate_manifest()
    write_json(f"{pack_dir}/manifest.json", manifest)
    print(f"✓ Generated manifest.json")
    
    # Generate timeline (NDJSON)
    events = generate_timeline_events(plan["plan_id"])
    os.makedirs(f"{pack_dir}/timeline", exist_ok=True)
    with open(f"{pack_dir}/timeline/events.ndjson", "w") as f:
        for event in events:
            f.write(json.dumps(event, sort_keys=True) + "\n")
    print(f"✓ Generated timeline/events.ndjson ({len(events)} events)")
    
    # Generate integrity hashes
    sums_path = generate_sha256sums(pack_dir)
    print(f"✓ Generated integrity/sha256sums.txt")
    
    # Calculate pack_root_hash
    with open(sums_path, "rb") as f:
        pack_root_hash = hashlib.sha256(f.read()).hexdigest()
    
    # Write pack_root_hash to file
    with open(f"{pack_dir}/pack_root_hash.txt", "w") as f:
        f.write(pack_root_hash + "\n")
    
    print(f"\n✅ Pack generated successfully!")
    print(f"   pack_root_hash: {pack_root_hash}")
    
    return pack_root_hash

if __name__ == "__main__":
    main()
