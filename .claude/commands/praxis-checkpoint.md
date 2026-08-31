---
description: Save everything, clear the context, continue in this same session
---

Checkpoint this session: save ALL of its knowledge to disk, then clear the
context and keep going — same session, nothing lost. Follow every step.

1. If `.praxis/memory.md` does not exist, stop and tell the user to run
   `npx praxis-memory` here first — one command, then try again.

2. Write the rich resume brief to `.praxis/checkpoints/RESUME.md` (create the
   folder if needed). You have the live context — write it so a fresh you can
   continue without asking a single question:
   - What we are building, in plain words.
   - Every decision made this session, WITH the why.
   - Files touched and the state each one is in.
   - The exact next steps, in order.
   - Open questions or risks, if any.
   Never write secrets, API keys, tokens, passwords, or credentials.
   If `RESUME.md` already exists, fold anything still relevant from it into the
   new brief instead of blindly overwriting.

3. Run `npx -y praxis-memory checkpoint --from-claude` in the shell. It archives the full
   conversation, mirrors into an Obsidian vault when one is set up, and logs
   the brief into project memory — all pre-flight-checked, nothing overwritten
   silently. If it reports a problem, fix that first and re-run it.

4. Then tell the user exactly this, and nothing before it:
   "Checkpoint saved — the full conversation and a resume brief are on disk.
   Now run /compact: the session clears and continues right here, and the
   brief reloads automatically. Nothing is lost."

You cannot run /compact yourself — only the user can. Do not pretend
otherwise, and do not clear anything on your own.
