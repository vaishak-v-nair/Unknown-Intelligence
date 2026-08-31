---
description: Save a fact or decision into PRAXIS project memory right now
argument-hint: <the fact, decision, or gotcha to remember>
---

Write this into the project's PRAXIS memory immediately: **$ARGUMENTS**

1. Read `.praxis/memory.md`.
2. Decide where it belongs:
   - a durable fact about the project (architecture, convention, constraint) → merge it into the `## Project` section;
   - something that happened or was decided today → prepend a dated line under `## Session Log`.
3. Keep the wording tight — one or two lines. Include the *why* if it was given.
4. Never write secrets, API keys, tokens, passwords, or credentials.
5. Confirm to the user in one line what was remembered and where.

If `.praxis/memory.md` does not exist in this project, stop and tell the user to run `npx praxis-memory` here first — one command, works on Windows, macOS and Linux.
