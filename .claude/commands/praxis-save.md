---
description: Summarize this session into PRAXIS project memory
---

Update this project's PRAXIS memory so future Claude Code sessions keep today's context.

1. Read `.praxis/memory.md`.
2. From THIS session, identify: what changed, why, what is in progress, key decisions, and any gotchas worth remembering.
3. Merge into `.praxis/memory.md`:
   - Update the `## Project` section with durable facts (architecture, conventions, important files). Keep it tight.
   - Prepend a dated entry under `## Session Log` (newest first) with a short summary.
4. Never write secrets, API keys, tokens, passwords, or credentials into the file.
5. Do not touch anything between the `<!-- PRAXIS:... -->` markers in CLAUDE.md.

Keep the whole file concise — it is loaded into every future session, so signal over volume.

If `.praxis/memory.md` does not exist in this project, stop and tell the user to run `npx praxis-memory` here first — one command, works on Windows, macOS and Linux.
