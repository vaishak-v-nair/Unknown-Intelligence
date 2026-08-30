# Unknown-Unknowns Intelligence
## Product, Research, and Engineering Specification

**Status:** Concept / Pre-MVP
**Primary objective:** Define a buildable system that discovers important things the user did not explicitly ask about.
**Initial strategy:** Start as a narrow discovery system, not as a general autonomous agent.
**Long-term direction:** Discovery Engine → Investigation Agent → Continuous Reality Monitor → Learning System.

---

# 1. Executive Definition

## 1.1 What we are building

Unknown-Unknowns Intelligence is a system that examines a changing body of information and identifies **meaningful observations that were not explicitly requested by the user**.

The system should not merely summarize information, answer questions, search documents, or detect generic anomalies.

Its central job is:

> **Find something important that the user did not know to ask about, provide evidence for why it matters, investigate it, and eventually help determine what should happen next.**

The first product should be narrow and concrete enough to build with free or very low-cost infrastructure.

## 1.2 The core distinction

Traditional information systems are mostly reactive:

```text
User asks question
        ↓
System retrieves information
        ↓
System answers
```

Unknown-Unknowns Intelligence is proactive:

```text
Information arrives
        ↓
System builds current state
        ↓
System compares observations with expectations / history / related evidence
        ↓
System finds unusual or contradictory patterns
        ↓
System estimates significance
        ↓
System investigates
        ↓
System produces a verified discovery
```

The product is therefore not "chat with your data".

It is an **evidence-driven discovery system**.

---

# 2. The Problem

People and organizations continuously accumulate information faster than they can inspect it.

Important signals are often buried inside:

- documents
- reports
- logs
- datasets
- messages
- research papers
- metrics
- public records
- event streams
- historical records
- structured databases

The problem is not always lack of information.

The problem is failure to notice relationships such as:

- a meaningful change from historical behavior
- contradictory statements across sources
- an emerging trend that has not yet been labeled
- a missing piece of expected evidence
- an abnormal combination of otherwise normal events
- a weak signal that becomes important when combined with other signals
- a new relationship between entities
- a repeated failure pattern
- a condition that is slowly drifting toward a dangerous state

Most AI systems are optimized to answer known questions.

This product is optimized to surface **useful unknowns**.

---

# 3. What This Is NOT

This section is mandatory. Do not accidentally turn the product into one of these.

## 3.1 Not a generic RAG chatbot

RAG may be used internally, but "ask questions over documents" is not the product.

## 3.2 Not a generic anomaly detector

Statistical anomalies are inputs to investigation, not the final product.

A rare event is not automatically important.

## 3.3 Not a summarizer

A summary describes what is already present.

The system must prioritize **novel, consequential, or previously unnoticed findings**.

## 3.4 Not a generic autonomous agent

Agentic execution comes later.

The initial system should prove that it can reliably discover and verify useful findings before it is allowed to take actions.

## 3.5 Not a dashboard

Charts are optional presentation tools. They are not the core product.

## 3.6 Not a foundation model

Use frontier or open models as interchangeable reasoning components.

Do not attempt to compete by training a general-purpose model.

---

# 4. Product Thesis

The long-term thesis is:

> As AI becomes better at answering explicit questions and executing explicit tasks, a valuable remaining problem is helping people discover **which questions they should have asked**.

A strong system should move through these layers:

```text
Layer 1: Retrieval
"Find what I asked for."

Layer 2: Analysis
"Explain what the data says."

Layer 3: Detection
"Find unusual or contradictory things."

Layer 4: Discovery
"Find something important I was not looking for."

Layer 5: Investigation
"Determine whether the discovery is real and why it happened."

Layer 6: Decision support
"Determine what should happen next."

Layer 7: Action
"Execute the permitted response."

Layer 8: Learning
"Measure what happened and improve future discovery."
```

The MVP should target Layers 3 and 4, with enough of Layer 5 to prove the concept.

---

# 5. The Most Important Product Question

Every candidate finding must answer:

> **Why should the user care?**

A finding is not valuable merely because it is:

- unusual
- statistically rare
- semantically interesting
- surprising
- novel to the model

A useful discovery should have evidence that it is **material, actionable, strategically relevant, or otherwise consequential** for the selected domain.

Therefore the system should rank candidate findings using at least four dimensions:

```text
Novelty
Significance
Evidence quality
Actionability
```

A fifth dimension should be added when enough historical data exists:

```text
Expected impact
```

---

# 6. Initial Product Shape

The first public version should be a narrow application with this basic flow:

```text
User uploads or supplies a dataset
            ↓
System ingests and normalizes it
            ↓
System creates searchable / analyzable representations
            ↓
System establishes historical and contextual baselines
            ↓
System generates candidate findings
            ↓
System removes trivial findings
            ↓
System investigates the strongest candidates
            ↓
System verifies evidence
            ↓
System presents discoveries
```

The UI should focus on **findings**, not on chat.

Example finding card:

```text
DISCOVERY

A supplier's delivery reliability has deteriorated for 6 consecutive
weeks, although the monthly supplier score still appears normal.

Why this matters:
The deterioration is concentrated in two critical product lines.

Evidence:
- Delivery records from weeks 1–6
- Product-line dependency records
- Historical baseline

Confidence: High

Recommended investigation:
Check whether the supplier changed fulfillment routes or capacity.
```

The exact domain will be selected separately.

---

# 7. Core System Architecture

The system should be modular.

```text
                    ┌───────────────────────┐
                    │       INPUT DATA      │
                    │ docs / tables / APIs  │
                    │ logs / records / web  │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │      INGESTION        │
                    │ parse / normalize     │
                    │ deduplicate / index   │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │   STATE / KNOWLEDGE   │
                    │ entities / relations │
                    │ history / context     │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │ CANDIDATE GENERATION  │
                    │ changes / conflicts   │
                    │ gaps / relationships  │
                    │ weak signals          │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │ SIGNIFICANCE FILTER   │
                    │ novelty / impact      │
                    │ domain relevance      │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │    INVESTIGATION      │
                    │ retrieve evidence     │
                    │ test hypotheses       │
                    │ compare alternatives  │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │      VERIFICATION     │
                    │ claim ↔ evidence      │
                    │ contradiction checks  │
                    │ confidence            │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │       DISCOVERY       │
                    │ finding / explanation │
                    │ evidence / confidence │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │ HUMAN FEEDBACK /      │
                    │ OUTCOME               │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │ LEARNING / CALIBRATION│
                    └───────────────────────┘
```

---

# 8. Components

## 8.1 Ingestion layer

Responsibilities:

- accept common file formats
- extract text and structured values
- preserve metadata
- preserve timestamps
- identify source
- normalize records
- deduplicate records
- maintain provenance

Critical rule:

**Never discard provenance.**

Every derived finding must be traceable back to the underlying data.

## 8.2 State layer

A document index alone is insufficient.

The system needs a representation of current and historical state.

Minimum concepts:

```text
Entity
Attribute
Event
Relationship
Observation
Timestamp
Source
Baseline
Expectation
Finding
Hypothesis
Outcome
```

The implementation can begin with conventional storage and retrieval. A graph database is not required for MVP unless experiments show a clear benefit.

## 8.3 Baseline builder

The system needs to understand what "normal" means.

Possible baselines:

- historical average
- rolling window
- seasonality
- known operating range
- peer group
- expected sequence
- rule-based expectation
- domain constraint

Do not assume that the newest observation is the truth.

## 8.4 Candidate generator

Candidate generation should use multiple mechanisms.

Examples:

### Change detection

Find meaningful changes over time.

### Contradiction detection

Find claims or records that cannot both be true under the same assumptions.

### Missing-evidence detection

Find expected information that is absent.

### Relationship discovery

Find meaningful associations across entities or datasets.

### Pattern composition

Find combinations of individually ordinary signals that become important together.

### Drift detection

Find gradual changes that are difficult to notice in snapshots.

### Exception discovery

Find situations that violate known expectations or constraints.

The system should not rely on an LLM alone for candidate generation.

Use deterministic or statistical methods where appropriate, then use models for semantic reasoning.

---

# 9. Significance Engine

This is one of the most important components.

A candidate finding should be scored, not blindly surfaced.

Conceptual score:

```text
DiscoveryScore =
    Novelty
  × Significance
  × EvidenceQuality
  × Relevance
  × Actionability
```

This is a conceptual framework, not a required literal multiplication formula.

The system must explicitly distinguish:

```text
Interesting ≠ Important
Rare ≠ Dangerous
Correlated ≠ Causal
Surprising ≠ Useful
Model-generated ≠ Verified
```

### Suppression rules

Suppress findings that are:

- trivial
- already known
- duplicates
- unsupported
- too weak to matter
- impossible to validate
- caused by obvious data-quality errors
- only interesting because of model speculation

A system that produces 100 weak discoveries is worse than a system that produces 3 strong ones.

---

# 10. Investigation Engine

After generating a candidate, the system should investigate it instead of immediately declaring it true.

For each candidate:

```text
Candidate
   ↓
What exactly is being claimed?
   ↓
What evidence supports it?
   ↓
What evidence contradicts it?
   ↓
What alternative explanations exist?
   ↓
What assumptions are required?
   ↓
What additional evidence would distinguish the explanations?
   ↓
What can be verified automatically?
   ↓
Final finding
```

The investigation engine should be allowed to return:

```text
VERIFIED
PARTIALLY VERIFIED
UNRESOLVED
REFUTED
INSUFFICIENT EVIDENCE
```

Never force a positive discovery.

---

# 11. Evidence and Verification

This is mandatory.

Every significant statement must have evidence.

Each discovery should contain:

```text
Claim
Evidence
Source
Timestamp
Reasoning path
Contradicting evidence
Confidence
Known limitations
```

Example:

```text
Claim:
Supplier delivery reliability is deteriorating.

Evidence:
- 17 late deliveries during the last 6 weeks
- historical average was 4.2 per 6 weeks
- deterioration is concentrated in product class B

Counterevidence:
- total monthly supplier volume increased 8%

Confidence:
High

Interpretation:
The absolute late-delivery count increased materially even after
accounting for higher order volume.
```

Confidence must be earned from evidence, not generated as a decorative model field.

---

# 12. RAG's Role

RAG is an internal capability, not the product identity.

Use retrieval for:

- locating relevant source evidence
- comparing records
- retrieving historical context
- finding domain rules
- grounding explanations
- checking contradictions
- supporting investigations

The retrieval stack may eventually include:

```text
keyword search
semantic search
metadata filtering
reranking
structured queries
knowledge graph traversal
web retrieval
```

Use the simplest retrieval method that works.

Do not introduce GraphRAG, agents, or complex orchestration merely because they are fashionable.

---

# 13. Agentic Role

Agentic behavior should be introduced only after the discovery engine is reliable.

## Stage A: bounded investigation

The system chooses from a small set of investigation tools.

## Stage B: multi-step investigation

The system can retrieve, compare, calculate, test and revisit hypotheses.

## Stage C: continuous monitoring

The system periodically reevaluates new information and state.

## Stage D: action proposal

The system creates a recommended action plan.

## Stage E: supervised execution

The system can perform approved actions.

## Stage F: autonomous execution

Only for low-risk, well-understood workflows with clear rollback and auditability.

---

# 14. Long-Term Learning Loop

The important long-term asset is not just documents.

It is the history of discoveries and their outcomes.

```text
Observation
    ↓
Candidate discovery
    ↓
Investigation
    ↓
Human judgement
    ↓
Action
    ↓
Observed outcome
    ↓
Was the discovery useful?
    ↓
Calibration / learning
```

Store:

- accepted discoveries
- rejected discoveries
- false positives
- missed discoveries
- investigation trajectories
- human corrections
- actions taken
- outcomes

This creates a feedback dataset specific to the domain.

---

# 15. The First Domain

The domain must be selected using evidence, not enthusiasm.

A good first domain has:

1. Large information volume.
2. Frequent information changes.
3. Expensive missed signals.
4. Observable outcomes.
5. Public or low-cost data for MVP.
6. A user who can judge whether a discovery is useful.
7. A workflow that can eventually become actionable.
8. Weak enough existing competition that the product can establish a wedge.

A bad first domain requires:

- expensive proprietary data
- long enterprise sales cycles
- deep regulated integrations
- physical deployment before value is proven
- large upfront capital
- a foundation model or GPU cluster

The domain selection process must therefore be a research problem before it becomes an engineering problem.

---

# 16. Zero-Budget MVP Constraint

The first prototype should be possible without:

- paid cloud infrastructure
- dedicated GPUs
- paid proprietary datasets
- enterprise contracts
- custom foundation-model training

Use free/open resources where possible.

Potential building blocks:

- local Python environment
- SQLite or DuckDB
- local embeddings if needed
- open-source models where useful
- free/open datasets
- public APIs with generous free tiers
- GitHub
- simple web UI

The MVP should prioritize **proof of discovery quality** over scale.

A small dataset with ten genuinely useful discoveries is more valuable than a million documents with weak output.

---

# 17. MVP Acceptance Test

The MVP is not successful because it can:

- ingest documents
- run RAG
- call an LLM
- produce summaries
- use agents
- show charts

The MVP is successful when:

> **A real user sees at least one meaningful finding they did not know to look for and agrees that the finding was useful.**

Stronger validation:

```text
Given dataset D,

Human baseline discovers H findings.

System discovers S findings.

Measure:
- valid discoveries
- novel discoveries
- useful discoveries
- false positives
- missed human findings
- evidence quality
- time saved
```

A useful target is not "100% recall".

A better early goal is a high precision rate for a small number of high-value findings.

---

# 18. Evaluation Framework

Create an evaluation set before adding complexity.

Each test case should contain:

```text
Input data
Known hidden issue
Available evidence
Expected investigation path
Acceptable conclusions
Known distractors
```

Evaluate:

### Discovery precision

How many surfaced discoveries are genuinely meaningful?

### Discovery novelty

How many were not explicitly requested or obvious from the prompt?

### Evidence correctness

Does the evidence actually support the claim?

### Investigation quality

Did the system examine reasonable alternative explanations?

### False-positive rate

How often does it raise noise?

### Miss rate

How often does it fail to notice important issues included in the evaluation set?

### Calibration

Do confidence scores correspond to actual correctness?

### Time-to-discovery

How quickly does the system find the issue relative to a human baseline?

### User value

Would a real user change a decision because of the discovery?

---

# 19. Anti-Hallucination Rules

These rules override convenience.

1. Never claim a discovery without evidence.
2. Never convert correlation into causation without support.
3. Never hide conflicting evidence.
4. Never manufacture a missing fact.
5. Never use confidence as a substitute for evidence.
6. Never treat model agreement as independent verification.
7. Never silently change timestamps or historical state.
8. Never discard source provenance.
9. Always distinguish observation from interpretation.
10. Prefer "unresolved" over an invented explanation.

---

# 20. Model Strategy

The product must remain model-agnostic.

Treat models as replaceable reasoning components.

Possible architecture:

```text
                     MODEL ROUTER
                          │
           ┌──────────────┼──────────────┐
           ↓              ↓              ↓
        Model A         Model B        Model C
           │              │              │
           └──────────────┼──────────────┘
                          ↓
                 Discovery System
```

Models may be used differently:

- small model for classification
- embedding model for retrieval
- strong reasoning model for investigation
- vision model for visual inputs
- deterministic code for arithmetic/statistics

Do not let a single model own the complete truth of the system.

---

# 21. Why Frontier Models Do Not Automatically Eliminate the Product

The system should assume frontier models will continue to improve dramatically.

Therefore the moat cannot be:

- better prompt engineering
- model access
- a generic agent loop
- basic RAG
- basic UI

The intended durable assets are:

```text
Domain state
Historical state
Observation history
Discovery history
Evidence provenance
Investigation trajectories
Human feedback
Outcome data
Domain-specific evaluation sets
```

A stronger external model should make the product better, not obsolete.

---

# 22. Research Questions That Must Be Answered Before Commitment

Do not assume the following are true. Test them.

## Market

- Is the problem painful enough that people will pay?
- Who experiences the pain?
- Who owns the budget?
- How frequently does the pain occur?
- What is currently used instead?

## Technical

- Can the system discover useful findings beyond simple anomaly detection?
- Can it maintain accurate state over time?
- Can it distinguish signal from noise?
- Can it verify claims reliably?
- Can it operate on inexpensive infrastructure?

## Competitive

- Are frontier platforms already shipping this exact workflow?
- Are startups already dominating the niche?
- Can a well-funded company copy the product in one product cycle?
- What data or workflow becomes proprietary over time?

## Distribution

- Can the first users be reached without large enterprise sales?
- Can the product demonstrate value before integrations?
- Can users self-serve?

## Defensibility

- Does usage generate proprietary feedback?
- Does the product become better with history?
- Does it accumulate domain-specific state?
- Does execution create an outcome dataset?

---

# 23. Competitive Pressure Test

For every chosen vertical, run this test against:

- OpenAI
- Anthropic
- Google
- Microsoft
- AWS
- existing vertical AI startups
- open-source agent frameworks
- domain incumbents

Ask:

```text
Can a frontier model do this today?
Can an agent framework do this today?
Can a customer build 80% of this internally?
Can a platform add this feature trivially?
Does the product require proprietary state to work well?
Does the product improve from longitudinal usage?
Does the product control a workflow rather than merely answer questions?
```

Reject any idea whose primary differentiation is simply model quality.

---

# 24. Product Evolution

The intended progression is:

## Version 0: Research prototype

Input → analysis → surprising findings.

## Version 1: Discovery product

Input → baseline → candidate findings → evidence-backed discoveries.

## Version 2: Investigation system

Discovery → hypothesis generation → evidence retrieval → competing explanations → verification.

## Version 3: Continuous intelligence

New information → continuous monitoring → emerging discoveries.

## Version 4: Agentic intelligence

Discovery → investigation → recommendation → supervised action.

## Version 5: Autonomous domain system

Monitor → discover → investigate → decide → act → verify → learn.

---

# 25. Possible Product Language

The product should avoid vague marketing language such as:

- "AI-powered insights"
- "next-generation intelligence"
- "revolutionary agent"
- "unlock hidden knowledge"
- "AI that thinks like a human"

Prefer precise language:

> **Find important things you were not looking for.**

or:

> **Turn incoming information into verified discoveries.**

or, after the system is proven:

> **An intelligence layer that continuously looks for what you missed.**

---

# 26. Failure Modes

## Failure mode 1: Everything becomes an anomaly

Cause: weak significance filtering.

Fix: establish strong domain baselines and outcome-based evaluation.

## Failure mode 2: Interesting but useless discoveries

Cause: optimizing novelty instead of impact.

Fix: measure user decisions and outcomes.

## Failure mode 3: Hallucinated causal explanations

Cause: allowing the model to fill gaps.

Fix: explicit claim/evidence separation and alternative-hypothesis testing.

## Failure mode 4: Duplicate discoveries

Cause: weak state/history tracking.

Fix: persistent finding registry.

## Failure mode 5: Product becomes a chatbot

Cause: optimizing for conversational demos.

Fix: make the home screen a ranked discovery feed and evidence view.

## Failure mode 6: Too much agent complexity too early

Cause: building future architecture before proving discovery.

Fix: start deterministic and bounded.

## Failure mode 7: No measurable value

Cause: discoveries are intellectually interesting but economically irrelevant.

Fix: choose a domain with observable outcomes.

## Failure mode 8: Frontier model absorbs the feature

Cause: product is just an intelligent prompt over user data.

Fix: build domain state, longitudinal history, evaluation, workflow and outcomes.

---

# 27. What the AI Builder Should Do

Any AI system receiving this document should behave as a product engineer/researcher, not as a generic code generator.

Before implementation:

1. Identify the selected domain.
2. Define the user and painful workflow.
3. Identify available datasets.
4. Define what counts as a discovery.
5. Define what evidence is required.
6. Design an evaluation set.
7. Establish a simple baseline.
8. Build the minimum discovery loop.

Do not:

- add technologies for prestige
- create unnecessary microservices
- introduce agents without a demonstrated need
- assume vector search is sufficient
- assume LLM reasoning is correct
- optimize for UI before discovery quality
- build enterprise integrations before proving value

---

# 28. Recommended Initial Technical Stack

This is intentionally conservative.

```text
Language: Python

Data:
- SQLite / DuckDB
- JSON / Parquet / CSV

Retrieval:
- lexical search first
- embeddings only where useful

LLM:
- any accessible strong reasoning model
- keep provider behind an interface

Analysis:
- Python / pandas / NumPy / SciPy where appropriate

UI:
- simple local or lightweight web application

Evaluation:
- versioned JSON test cases
- deterministic metrics
- manual review set

Version control:
- Git
```

A more sophisticated stack should be introduced only when measurements justify it.

---

# 29. First Engineering Milestone

The first milestone is not "complete RAG."

It is:

> **Given a real dataset, the system finds at least one non-obvious, evidence-backed, useful discovery that a reasonable human reviewer agrees was worth surfacing.**

Minimum implementation:

```text
ingest
  ↓
normalize
  ↓
state
  ↓
baseline
  ↓
candidate generation
  ↓
ranking
  ↓
investigation
  ↓
evidence verification
  ↓
discovery report
```

No autonomous actions are required.

---

# 30. The Core Mental Model

The entire project should be understood through one principle:

> **Most AI systems optimize for answering questions. This system optimizes for discovering the right questions.**

The next principle is equally important:

> **A discovery is valuable only when it survives evidence-based investigation.**

And the long-term principle is:

> **The system should become better at discovering reality by learning from what happened after previous discoveries.**

---

# 31. Final Product Vision

Long-term system:

```text
                 REAL / DIGITAL WORLD
                         │
                         ↓
                    OBSERVATIONS
                         │
                         ↓
                  CURRENT STATE
                         │
                         ↓
                EXPECTATION / BASELINE
                         │
                         ↓
                 DEVIATION SEARCH
                         │
                         ↓
               UNKNOWN DISCOVERY
                         │
                         ↓
                    INVESTIGATION
                         │
                         ↓
                     VERIFICATION
                         │
                         ↓
                      DECISION
                         │
                         ↓
                       ACTION
                         │
                         ↓
                       OUTCOME
                         │
                         ↓
                      LEARNING
                         │
                         └──────────────→ STATE
```

The final system is not merely a RAG product and not merely an agent.

It is a **continuous evidence-driven intelligence loop**.

---

# 32. Immediate Next Step

Do not start by implementing the final architecture.

The immediate task is to identify the **first domain** where the system can prove the following with public/free data:

> **"The system discovered something important that a normal information-search workflow would likely miss."**

Run the domain-selection process as an adversarial research exercise.

For each candidate domain, determine:

```text
Pain
Data availability
Existing solutions
Frontier-model capability
Discovery quality
Outcome measurability
Willingness to pay
Distribution
Defensibility
Agentic expansion
```

Choose the domain only after attempting to disprove the opportunity.

---

# 33. Definition of Success

This project succeeds only if it can move from:

```text
"Here is what you asked."
```

to:

```text
"Here is something important you did not ask about.

Here is the evidence.
Here is why it matters.
Here are the alternative explanations.
Here is what we still do not know.
Here is what we can verify next.
"
```

That is the product.

Everything else is implementation detail.
