# Getting Started with Talovi

Talovi is an open source AI framework that makes it easy for small businesses and
independent developers to deploy intelligent agents — without a big engineering team
or a big budget.

Homepage: [talovi.dev](https://talovi.dev) · [GitHub](https://github.com/Talovi/talovi)

---

## Prerequisites

- Node.js 18 or higher
- An API key for at least one supported provider:

| Provider | Key variable | Sign-up |
|----------|-------------|---------|
| Claude (default) | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| Gemini | `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Grok | `GROK_API_KEY` | [console.x.ai](https://console.x.ai/) |
| Ollama | *(none — runs locally)* | [ollama.com/download](https://ollama.com/download) |

---

## Installation

```bash
npm install talovi
```

Copy `.env.example` to `.env` and fill in the key for your chosen provider:

```bash
cp .env.example .env
```

```
# .env — only the provider you're using needs a value
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=
GROK_API_KEY=
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

Talovi supports three provider-agnostic tiers. Each provider maps these to its
own model family — switch providers without changing any agent code.

| Tier | Best for | Example models |
|------|----------|----------------|
| `lite` | FAQs, routing, high-volume tasks | Haiku · Flash 8B · Grok-3-fast · Llama3:8b |
| `standard` | Most business tasks *(default)* | Sonnet · Flash · Grok-3 · Llama3 |
| `pro` | Complex reasoning, sensitive decisions | Opus · Pro · Grok-3-heavy · Llama3:70b |

Override the tier per-call:

```js
const reply = await agent.run('Summarize this contract.', { tier: 'pro' });
```

Change the default for a domain in `config/talovi.config.js`:

```js
export const domainDefaults = {
  legal: 'pro',  // always use the pro model for legal questions
};
```

---

## Switching providers

Change one line in `config/talovi.config.js` — zero other code changes needed:

```js
// config/talovi.config.js
export const provider = 'gemini';  // 'claude' | 'gemini' | 'grok' | 'ollama'
```

Gemini and Grok require their optional SDK packages:

```bash
npm install @google/generative-ai   # for Gemini
npm install openai                  # for Grok
```

Run the provider-switch demo to try it:

```bash
node examples/provider-switch.js gemini
```

---

## Maintaining conversation history

Pass prior turns to preserve context across multiple messages:

```js
const history = [];

const first = await agent.run('My store is called Bloom & Co.', { history });
history.push({ role: 'user',      content: 'My store is called Bloom & Co.' });
history.push({ role: 'assistant', content: first });

const second = await agent.run('Write an Instagram bio for us.', { history });
```

---

## Streaming responses

Use `agent.stream()` to receive text as it arrives — useful for chat UIs:

```js
process.stdout.write('Response: ');
for await (const chunk of agent.stream('Explain this lease clause: ...')) {
  process.stdout.write(chunk);
}
console.log();
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

Edit `config/talovi.config.js` to change the active provider, model tier defaults,
generation settings, and privacy options. See inline comments for details.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss significant changes.
See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
