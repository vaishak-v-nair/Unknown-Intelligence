---
description: Update PRAXIS — check what is stale here and bring it current
---

Run `npx -y praxis-memory update` with the Bash tool and show me its output.

Then, in plain English:

1. Say whether anything actually needed updating — one sentence. If the answer
   was "nothing", say that and stop. Do not manufacture work.
2. If a newer version exists, tell me what changed in it. Read `CHANGELOG.md`
   from the repo if it is in this project; otherwise point me at
   https://github.com/vaishak-v-nair/PRAXIS/blob/main/CHANGELOG.md rather than
   guessing at the contents.
3. If it printed a command for me to run myself (the global install), explain
   why it did not run it: a global install changes a tool outside this project,
   so that stays my call. Offer to run it if I want.

Worth knowing, and worth telling me if I seem surprised: the capture hooks and
the MCP server are wired as `npx -y praxis-memory`, so they already run the
newest published version every session. The things that go stale are the
`praxis` command on PATH, if I installed one globally, and the `/praxis-*` slash
commands — those are copied into a project when it is set up, so a release that
adds a new command never reaches projects that already existed.

Nothing here is sent anywhere. The only network call is asking the npm registry
for the current version number.
