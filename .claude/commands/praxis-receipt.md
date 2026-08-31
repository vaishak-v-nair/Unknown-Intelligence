---
description: Proof of what the AI did this session — the receipt
---

Run `npx -y praxis-memory receipt` with the Bash tool and show me the output.

If I asked to verify ("did it really do that?", "check the claims"), run
`npx -y praxis-memory receipt --verify` instead — it has an adversarial judge
rule each claim against the recorded evidence (one model call, ~a minute).

If I asked for something shareable, run `npx -y praxis-memory receipt --html`
and tell me where the card was written.

Then give me one honest sentence: what the receipt shows, and whether anything
failed or could not be verified.
