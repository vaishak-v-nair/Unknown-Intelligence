# The Discovery Engine Logic

> [!IMPORTANT]
> The defining feature of Unknown Intelligence is that it is a **proactive discovery system**, not a reactive chatbot. This document explains the logic behind how discoveries are generated, filtered, and investigated.

## 1. Candidate Generation (`candidate_generator.py`)

Rather than waiting for a user prompt, the Candidate Generator actively scans incoming data and historical state to form hypotheses.

It looks for:
- **Change detection**: Material deviations from established statistical baselines.
- **Contradictions**: Two records that cannot both logically be true.
- **Missing Evidence**: An expected sequential event that never arrived.
- **Drift**: Slow degradation or changes that don't trigger immediate absolute-value thresholds.

For machine learning anomalies, we utilize statistical baselines (e.g., Random Forest classifiers initialized in `dataset/train.ipynb`) to separate mathematically rare occurrences from standard operations.

## 2. The Significance Filter

A candidate anomaly is useless if it doesn't matter to the user. The Significance Filter calculates a score for every candidate finding.

```
DiscoveryScore = Novelty × Significance × EvidenceQuality × Actionability
```

> [!WARNING]
> Suppression is just as important as discovery. The filter rigorously suppresses trivial findings, duplicates, and unsupported speculations. A system that outputs 3 verified, highly actionable discoveries is vastly superior to one outputting 100 noisy alerts.

## 3. Investigation Engine (`investigator.py`)

When a candidate finding passes the Significance Filter, it is handed to the Investigation Engine. 
The Engine acts as an automated detective, seeking to either **verify** or **refute** the hypothesis.

### The Verification Loop:
1. **Claim Extraction**: What exactly is the anomaly claiming?
2. **Evidence Retrieval**: What data supports this claim? (Retrieves vectors from `Milvus` and provenance records from `MongoDB`).
3. **Counter-Evidence Search**: What alternative explanations exist? Are there records that directly refute the claim?
4. **Resolution**: The finding is labeled as `VERIFIED`, `REFUTED`, `PARTIALLY VERIFIED`, or `INSUFFICIENT EVIDENCE`.

## 4. Output: The Finding

Verified discoveries are persisted to MongoDB in the `findings` collection. They must always maintain **provenance**.

Every finding surfaced to the user includes:
- The actual claim.
- The `evidence_ids` linking back to the exact source documents.
- The significance score and confidence rating.
- The recommended action or investigation point.
