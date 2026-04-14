```
  ████████╗ █████╗ ██╗      ██████╗ ██╗   ██╗██╗
  ╚══██╔══╝██╔══██╗██║     ██╔═══██╗██║   ██║██║
     ██║   ███████║██║     ██║   ██║██║   ██║██║
     ██║   ██╔══██║██║     ██║   ██║╚██╗ ██╔╝██║
     ██║   ██║  ██║███████╗╚██████╔╝ ╚████╔╝██║
     ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═══╝ ╚═╝
```

# Talovi

**Open source AI framework for small businesses and disadvantaged developers.**

[![npm version](https://img.shields.io/badge/npm-0.1.0-brightgreen)](https://www.npmjs.com/package/talovi)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Talovi/talovi?style=flat)](https://github.com/Talovi/talovi/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Talovi/talovi?style=flat)](https://github.com/Talovi/talovi/network/members)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-blueviolet)](https://www.anthropic.com)

---

## Why Talovi exists

AI is changing what's possible for businesses — but most of that change is happening
at companies with large engineering teams and large budgets.

Talovi is for everyone else. The corner shop owner who wants to reply to reviews
without spending an hour writing. The independent pharmacist who needs a smarter
patient intake form. The solo real estate agent trying to draft a better listing.
The first-generation developer building their first real product with tools they
actually have access to.

**We believe AI should be a level playing field. Talovi is how we build toward that.**

---

## Features

- **Model-agnostic** — works with Claude, Gemini, Grok, and Ollama out of the box
- **Multi-agent routing** — built-in agents for Healthcare, Legal, Real Estate, Retail, and General business tasks
- **Three model tiers** — `lite`, `standard`, and `pro` let you match cost to complexity across any provider
- **Bring your own key** — zero vendor lock-in, no proprietary cloud, no middleman
- **One-line provider switching** — change a single config value to move from Claude to Gemini to local Ollama
- **Open source, MIT licensed** — free to use, fork, and build on forever

---

## Quick start

```bash
npm install talovi
export ANTHROPIC_API_KEY=sk-ant-...   # or GEMINI_API_KEY, GROK_API_KEY — your call
```

```js
import { AgentRouter } from 'talovi';

const router = new AgentRouter();
const { domain, response } = await router.route(
  'What should I include in a standard freelance contract?'
);

console.log(`[${domain}]`, response);
// [legal] A standard freelance contract should include...
```

That's it. Talovi reads your message, picks the right agent, and returns a response.
No configuration required to get started. [Full docs →](docs/getting-started.md)

---

## Provider support

Switch providers by changing one line in `config/talovi.config.js`.
Your agent code stays exactly the same.

| Provider | `lite` | `standard` | `pro` | Key required |
|----------|--------|-----------|-------|-------------|
| **Claude** *(default)* | Haiku | Sonnet | Opus | `ANTHROPIC_API_KEY` |
| **Gemini** | Flash 8B | Flash | Pro | `GEMINI_API_KEY` |
| **Grok** | Grok-3-fast | Grok-3 | Grok-3-heavy | `GROK_API_KEY` |
| **Ollama** | Llama3:8b | Llama3 | Llama3:70b | *(none — runs locally)* |

```js
// config/talovi.config.js — this one line is all it takes
export const provider = 'gemini';  // 'claude' | 'gemini' | 'grok' | 'ollama'
```

---

## Agent domains

Every agent comes with a carefully written system prompt, sensible defaults,
and clear boundaries about what it will and won't do.

| Agent | Who it serves | Default tier |
|-------|--------------|-------------|
| `HealthcareAgent` | Clinics, community health, patient communications | `standard` |
| `LegalAgent` | Small businesses, nonprofits, individuals without legal counsel | `standard` |
| `RealEstateAgent` | Independent agents, small brokerages, first-time buyers | `standard` |
| `RetailAgent` | Shops, boutiques, independent e-commerce stores | `lite` |
| `GeneralAgent` | Any small business task that doesn't fit a specific domain | `lite` |

Use an agent directly or let `AgentRouter` pick the right one automatically:

```js
import { HealthcareAgent, AgentRouter } from 'talovi';

// Direct
const agent = new HealthcareAgent();
const reply = await agent.run('What should I include in a patient intake form?');

// Auto-routed
const router = new AgentRouter();
const { domain, response } = await router.route('How do I handle a lease renewal?');
```

---

## Configuration

`config/talovi.config.js` is the single place to tune Talovi for your project:

```js
// Which AI backend to use — one line to rule them all
export const provider = 'claude';

// API keys for each provider (pulled from environment variables)
export const providers = {
  claude: { apiKey: process.env.ANTHROPIC_API_KEY },
  gemini: { apiKey: process.env.GEMINI_API_KEY },
  grok:   { apiKey: process.env.GROK_API_KEY },
  ollama: { baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434' },
};

// Per-domain model tier defaults — override per-call with { tier: 'pro' }
export const domainDefaults = {
  healthcare: 'standard',
  legal:      'standard',
  realestate: 'standard',
  retail:     'lite',
  general:    'lite',
};
```

---

## Contributing

Talovi grows through contributions from people who care about the communities
it serves. Adding a new agent or provider is straightforward — we've written
step-by-step guides for both.

Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

PR titles follow the `feat: add [name]` convention (e.g. `feat: add nonprofit agent`,
`feat: add mistral provider`). New agent and provider issue templates are ready to go
in [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/).

If you work in healthcare, law, real estate, or retail and want to help make the
agent prompts more accurate for real-world use — that's one of the most valuable
things you can do for this project.

---

## Built with Claude

Talovi was built using [Claude](https://www.anthropic.com) — Anthropic's AI assistant —
as the primary development tool. We think that's worth saying plainly: an open source
framework designed to make AI more accessible was itself built with AI.

Talovi is an independent open source project and is not affiliated with Anthropic.

---

## By ITLasso

<p>
  Built and maintained by <a href="https://itlasso.com"><strong>ITLasso</strong></a> —
  technology services for small businesses in Canton, Ohio and beyond.
</p>

We build tools like Talovi because we work with small businesses every day and see
first-hand what a difference the right technology makes. If you're a small business
owner looking for hands-on help, [we'd love to hear from you](https://itlasso.com).

---

## License

[MIT](LICENSE) — free to use, modify, and distribute. No strings attached.
