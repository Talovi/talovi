# Contributing to Talovi

Thanks for taking the time to contribute. Talovi exists to give small businesses
and disadvantaged developers access to AI tools they'd otherwise be priced out of —
every contribution moves that mission forward.

---

## Table of contents

1. [Code of conduct](#code-of-conduct)
2. [Ways to contribute](#ways-to-contribute)
3. [Development setup](#development-setup)
4. [Branch and commit conventions](#branch-and-commit-conventions)
5. [Adding a new agent](#adding-a-new-agent)
6. [Adding a new provider](#adding-a-new-provider)
7. [Pull request process](#pull-request-process)
8. [Reporting issues](#reporting-issues)

---

## Code of conduct

This project is built *for* communities that often face barriers to technology.
We hold ourselves to a simple standard: be respectful, be helpful, assume good
intent. Harassment, gatekeeping, and exclusionary language have no place here.

---

## Ways to contribute

You don't need to write code to contribute:

- **Open an issue** — bug reports, feature requests, and domain knowledge are
  all valuable. If you're a healthcare worker, paralegal, or shop owner and you
  see something wrong in an agent prompt, that's a high-value contribution.
- **Improve docs** — clarify the getting started guide, fix typos, add examples.
- **Add an agent** — new domain verticals are always welcome. See below.
- **Add a provider** — new AI backends broaden access. See below.
- **Review PRs** — a second pair of eyes is always useful.

---

## Development setup

```bash
git clone https://github.com/Talovi/talovi.git
cd talovi
npm install
```

Set at least one provider key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # Claude (default)
# or
export GEMINI_API_KEY=...             # Gemini
# or
export GROK_API_KEY=...               # Grok
# or start Ollama locally             # no key needed
```

Run the demo to confirm your setup:

```bash
node examples/demo.js
```

---

## Branch and commit conventions

**Branch naming**

```
feat/add-<name>       # new feature, agent, or provider
fix/<short-description>
docs/<short-description>
chore/<short-description>
```

**Commit messages — [Conventional Commits](https://www.conventionalcommits.org/)**

```
feat: add [name] agent
feat: add [name] provider
fix: correct model tier resolution in BaseAgent
docs: update getting started guide for Ollama
chore: bump @anthropic-ai/sdk to 0.40.0
```

The PR title must match this convention — it becomes the squash-merge commit
message and feeds the changelog.

---

## Adding a new agent

1. Open an issue using the **New agent** template first (or comment on an
   existing one) so we can align on scope and prompt strategy before you code.
2. Create `agents/<domain>.js` extending `BaseAgent`:

```js
import { BaseAgent } from '../src/agent.js';

const SYSTEM_PROMPT = `...`;

export class MyDomainAgent extends BaseAgent {
  constructor(options = {}) {
    super({ domain: 'mydomain', systemPrompt: SYSTEM_PROMPT, ...options });
  }
}
```

3. Export it from `src/index.js`.
4. Add a default tier in `config/talovi.config.js → domainDefaults`.
5. Update the agent table in `README.md` and `docs/getting-started.md`.
6. Include at least one usage example in your PR description.

**Prompt guidelines**

- Open with who the agent serves and what it helps with.
- List concrete capabilities.
- Be explicit about what the agent will **not** do (liability boundaries matter
  especially for healthcare and legal domains).
- Use plain language — many users are not technical.

---

## Adding a new provider

1. Open an issue using the **New provider** template first.
2. Create `src/providers/<name>.provider.js` extending `BaseProvider`:

```js
import { BaseProvider } from './base.provider.js';

const MODELS = { lite: '...', standard: '...', pro: '...' };

export class MyProvider extends BaseProvider {
  constructor(config = {}) { super(config); }
  getModels()   { return MODELS; }
  validateKey() { return Boolean(this.config.apiKey); }
  async complete(messages, systemPrompt, options = {}) { ... }
  async *stream(messages, systemPrompt, options = {}) { ... }
}
```

3. Register it in `src/providers/index.js`.
4. Add a `providers.<name>` block in `config/talovi.config.js`.
5. Add credentials guidance to `docs/getting-started.md`.
6. If the SDK is an optional dependency, use a **lazy dynamic import** with a
   helpful install message (see `gemini.provider.js` for the pattern).
7. Add the package to `optionalDependencies` in `package.json`.

---

## Pull request process

- **Title** must follow `feat: add [name]` / `fix: ...` convention (enforced by
  the PR template checklist).
- Keep PRs focused — one agent or provider per PR.
- All existing examples should still run after your change.
- Describe your testing approach: which model, what queries, what you verified.
- If you're adding a provider you don't have API access to, note that in the PR
  and a maintainer will run a smoke test.

PRs are merged by a maintainer after at least one approving review.

---

## Reporting issues

Use the GitHub issue templates:

- **New agent** — propose a new domain agent
- **New provider** — propose a new AI backend
- **Bug** — something is broken
- **Docs** — something is wrong or missing in the docs

For security vulnerabilities, please **do not** open a public issue.
Email the maintainers directly (address in package.json) or use GitHub's
private vulnerability reporting.

---

*Talovi is built with care for the communities it serves.
Thank you for being part of it.*
