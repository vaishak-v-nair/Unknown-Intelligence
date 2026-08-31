---
description: Pack a handoff brief and continue this work in another AI tool
---

The user wants to move this work to another tool: "$ARGUMENTS"

If no tool was named, ask which one: gemini · codex · claude · cursor · antigravity.

1. Suggest `/praxis-save` first if this session made decisions worth keeping —
   the freshest context rides along in the handoff.
2. Run `npx -y praxis-memory switch <tool>` with the Bash tool.
3. Show its output and walk the user through the printed next steps (the launch
   command is already on their clipboard).
