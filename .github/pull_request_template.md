## Title convention

PR titles must follow the pattern used by Conventional Commits.
This becomes the squash-merge commit message and feeds the changelog.

**Required format:** `type: add [name]` or `type: short description`

Common types: `feat` · `fix` · `docs` · `chore` · `refactor`

Examples:
- `feat: add nonprofit agent`
- `feat: add mistral provider`
- `fix: correct model tier resolution for ollama`
- `docs: add provider switching guide`

---

## What does this PR do?

<!-- One paragraph. What problem does it solve, and how? -->

## Type of change

- [ ] New agent (`feat: add [domain] agent`)
- [ ] New provider (`feat: add [name] provider`)
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactor / chore

## Related issue

<!-- Link with "Closes #123" to auto-close the issue on merge. -->

Closes #

---

## Checklist

### All PRs

- [ ] PR title follows `type: description` convention
- [ ] `node examples/demo.js` runs without errors
- [ ] No new `console.log` left in source files

### New agent PRs

- [ ] Agent file is at `agents/<domain>.js` and extends `BaseAgent`
- [ ] Exported from `src/index.js`
- [ ] Default tier added to `config/talovi.config.js → domainDefaults`
- [ ] Agent table updated in `README.md`
- [ ] System prompt includes an explicit "will NOT do" section
- [ ] At least 2 example queries tested and results look correct

### New provider PRs

- [ ] Provider file is at `src/providers/<name>.provider.js` and extends `BaseProvider`
- [ ] All four interface methods implemented: `complete()`, `stream()`, `getModels()`, `validateKey()`
- [ ] Registered in `src/providers/index.js`
- [ ] Config block added to `config/talovi.config.js → providers`
- [ ] Optional SDK dependency uses lazy dynamic import with install hint
- [ ] Package added to `optionalDependencies` in `package.json`
- [ ] `node examples/provider-switch.js <name>` tested (note API key used if applicable)

---

## Testing

<!-- Describe how you tested this change.
     For agents: which queries did you run, and what did the output look like?
     For providers: which model tier(s) did you test, any streaming verified? -->

## Screenshots / output (optional)

<!-- Paste terminal output or copy a response the agent generated. -->
