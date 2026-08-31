---
description: Remove outdated or wrong info from PRAXIS project memory
argument-hint: <what to forget, e.g. "the Redis lock approach">
---

Remove this from the project's PRAXIS memory: **$ARGUMENTS**

1. Read `.praxis/memory.md`.
2. Find every line or entry that matches what the user wants forgotten.
3. Before deleting, show the user exactly which lines will be removed and ask for a quick confirm if the match is ambiguous.
4. Delete the matching content. If removing it leaves a section empty, tidy the section.
5. If the fact was *superseded* rather than wrong, prefer replacing it with the current truth over plain deletion.
6. Confirm in one line what was forgotten.

If `.praxis/memory.md` does not exist in this project, stop and tell the user to run `npx praxis-memory` here first — one command, works on Windows, macOS and Linux.
