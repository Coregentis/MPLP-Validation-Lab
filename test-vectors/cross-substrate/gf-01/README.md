---
entry_surface: validation_lab
doc_type: informative
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-OTHER-012"
---

# GF-01 Cross-Substrate Equivalence Test

**Scenario**: Single Agent Plan  
**Strength**: S4 (Cross-substrate equivalence)  
**Substrates**: LangChain, A2A

---

## BYO Execution

> ⚠️ **Bring Your Own Execution**  
> These scripts run locally on your machine.  
> The Lab does not execute them and does not host submissions.  
> Evaluator runs locally using the repo validator CLI.

---

## Generate Evidence Packs

```bash
# LangChain pack
python langchain/generate_pack.py

# A2A pack
bash a2a/generate_pack.sh
```

---

## Verify Equivalence

```bash
# Uses local evaluator CLI (not hosted API)
npx tsx verify_equivalence.ts --evaluator=local-cli
```

Output: `Validation_Lab/releases/v0.2/artifacts/equivalence/gf-01.json`
