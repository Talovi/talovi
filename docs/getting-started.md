# Getting Started with Talovi

Talovi is an open source AI framework that makes it easy for small businesses and
independent developers to deploy intelligent agents — without a big engineering team
or a big budget.

---

## Prerequisites

- Node.js 18 or higher
- An [Anthropic API key](https://console.anthropic.com/)

---

## Installation

```bash
npm install talovi
```

Set your API key in the environment:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or create a `.env` file (never commit this):

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Quick start — automatic routing

The easiest way to get started is the `AgentRouter`. It reads your message and
automatically picks the right domain agent.

```js
import { AgentRouter } from 'talovi';

const router = new AgentRouter();

const { domain, response } = await router.route(
  'What should I include in a standard service agreement?'
);

console.log(`[${domain}]`, response);
// [legal] A standard service agreement should include...
```

---

## Using a specific agent

When you know your domain, use the agent directly:

```js
import { RetailAgent } from 'talovi';

const agent = new RetailAgent();

const reply = await agent.run(
  'Write a friendly response to a customer whose order arrived damaged.'
);

console.log(reply);
```

---

## Choosing a model tier

Talovi supports three tiers to balance cost and capability:

| Tier | Model | Best for |
|------|-------|----------|
| `lite` | Claude Haiku | FAQs, routing, high-volume tasks |
| `standard` | Claude Sonnet | Most business tasks (default) |
| `pro` | Claude Opus | Complex reasoning, sensitive decisions |

Override the tier per-call:

```js
const reply = await agent.run('Summarize this contract.', { tier: 'pro' });
```

Change the default for a domain in `config/talovi.config.js`:

```js
export const domainDefaults = {
  legal: 'pro',  // always use Opus for legal questions
};
```

---

## Maintaining conversation history

Pass prior turns to preserve context across multiple messages:

```js
const history = [];

const first = await agent.run('My store is called Bloom & Co.', { history });
history.push({ role: 'user', content: 'My store is called Bloom & Co.' });
history.push({ role: 'assistant', content: first });

const second = await agent.run('Write an Instagram bio for us.', { history });
```

---

## Available agents

| Agent | Import | Best for |
|-------|--------|----------|
| `GeneralAgent` | `import { GeneralAgent } from 'talovi'` | Catch-all business tasks |
| `HealthcareAgent` | `import { HealthcareAgent } from 'talovi'` | Clinics, wellness, patient comms |
| `LegalAgent` | `import { LegalAgent } from 'talovi'` | Contracts, compliance, document review |
| `RealEstateAgent` | `import { RealEstateAgent } from 'talovi'` | Listings, leases, buyer guidance |
| `RetailAgent` | `import { RetailAgent } from 'talovi'` | Product copy, customer service |

---

## Configuration

Edit `config/talovi.config.js` to change model defaults, generation settings,
and privacy options. See inline comments for details.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss significant changes.
See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
