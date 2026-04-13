# Talovi

**Open source AI framework for small businesses and disadvantaged developers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-0.1.0-brightgreen)](package.json)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-blueviolet)](https://www.anthropic.com)

---

## Mission

Access to AI shouldn't depend on the size of your budget or the size of your team.

Talovi is built for the independent pharmacist who needs a smarter patient intake
form, the solo real estate agent trying to draft a better listing, the corner shop
owner who wants to reply to reviews without spending an hour writing, and the
first-generation developer building their first real product.

We make enterprise-grade AI agents simple to deploy, affordable to run, and honest
about what they can and can't do.

---

## Features

- **Domain agents out of the box** — Healthcare, Legal, Real Estate, Retail, General
- **Tiered model support** — Route simple tasks to Claude Haiku (cheap & fast), complex ones to Claude Opus (powerful) — controlled in a single config file
- **Auto-routing** — Drop in `AgentRouter` and let Talovi pick the right agent automatically
- **Conversation history** — Pass prior turns to maintain context across messages
- **Privacy-first defaults** — No conversation logging, PII redaction on by default
- **Zero lock-in** — MIT licensed, no proprietary cloud, just the Anthropic API

---

## Quick start

```bash
npm install talovi
export ANTHROPIC_API_KEY=sk-ant-...
```

```js
import { AgentRouter } from 'talovi';

const router = new AgentRouter();
const { domain, response } = await router.route('What should I include in an NDA?');

console.log(`[${domain}]`, response);
// [legal] An NDA should typically include...
```

Or use an agent directly:

```js
import { RetailAgent } from 'talovi';

const agent = new RetailAgent();
const reply = await agent.run('Write a product description for a hand-poured soy candle.');
console.log(reply);
```

Run the full demo:

```bash
node examples/demo.js
```

---

## Available agents

| Agent | Domain | Default tier |
|-------|--------|-------------|
| `GeneralAgent` | Catch-all business tasks | lite |
| `HealthcareAgent` | Clinics, patient comms, wellness | standard |
| `LegalAgent` | Contracts, compliance, document review | standard |
| `RealEstateAgent` | Listings, leases, buyer guidance | standard |
| `RetailAgent` | Product copy, customer service, orders | lite |

Tiers map to Claude model families — change them globally in
[`config/talovi.config.js`](config/talovi.config.js) or per-call with
`agent.run(message, { tier: 'pro' })`.

---

## Project structure

```
talovi/
├── src/
│   ├── index.js        # Public API — import everything from here
│   ├── agent.js        # BaseAgent class
│   └── router.js       # AgentRouter — automatic domain dispatch
├── agents/
│   ├── healthcare.js
│   ├── legal.js
│   ├── realestate.js
│   ├── retail.js
│   └── general.js
├── config/
│   └── talovi.config.js   # Model tiers, generation defaults, privacy
├── docs/
│   └── getting-started.md
└── examples/
    └── demo.js
```

---

## Documentation

See [docs/getting-started.md](docs/getting-started.md) for full installation,
configuration, and usage instructions.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss significant changes.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

> Powered by [Claude](https://www.anthropic.com) — Anthropic's AI assistant.
> Talovi is an independent open source project and is not affiliated with Anthropic.
