/**
 * examples/provider-switch.js
 *
 * This example demonstrates the core promise of Talovi's provider abstraction:
 * change ONE line in config/talovi.config.js and every agent switches backend.
 *
 * The agent code shown here is identical regardless of provider.
 * The only difference is which provider is instantiated.
 *
 * Run with Claude (default):
 *   ANTHROPIC_API_KEY=sk-ant-... node examples/provider-switch.js claude
 *
 * Run with Gemini:
 *   GEMINI_API_KEY=... node examples/provider-switch.js gemini
 *
 * Run with Grok:
 *   GROK_API_KEY=... node examples/provider-switch.js grok
 *
 * Run with Ollama (no key needed — requires ollama running locally):
 *   node examples/provider-switch.js ollama
 */

import { LegalAgent } from '../src/index.js';
import { createProvider } from '../src/providers/index.js';
import taloviConfig from '../config/talovi.config.js';

// ─────────────────────────────────────────────────────────────────────────────
// The question every agent will answer — unchanged across providers
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION =
  'What are the three most important clauses in a standard freelance contract?';

// ─────────────────────────────────────────────────────────────────────────────
// Determine which provider to demo (arg or config default)
// ─────────────────────────────────────────────────────────────────────────────
const providerName = process.argv[2] ?? taloviConfig.provider;
const providerConfig = taloviConfig.providers[providerName] ?? {};

console.log(`\nTalovi provider-switch demo`);
console.log(`${'─'.repeat(50)}`);
console.log(`Provider : ${providerName}`);
console.log(`Tier     : standard (config/talovi.config.js → domainDefaults.legal)`);
console.log(`Question : ${QUESTION}`);
console.log(`${'─'.repeat(50)}\n`);

// ─────────────────────────────────────────────────────────────────────────────
// This is all the application code.
// Notice: it is IDENTICAL regardless of which provider is active.
// Swap the provider → same code, different backend.
// ─────────────────────────────────────────────────────────────────────────────

const provider = createProvider(providerName, providerConfig);

if (!provider.validateKey()) {
  console.error(
    `[talovi] No credentials found for provider "${providerName}".\n` +
    providerCredentialHint(providerName)
  );
  process.exit(1);
}

const agent = new LegalAgent({ provider });
const response = await agent.run(QUESTION);

console.log(response);

console.log(`\n${'─'.repeat(50)}`);
console.log(`To switch providers, change ONE line in config/talovi.config.js:\n`);
console.log(`  export const provider = '${providerName}';  // ← change this`);
console.log(`\nAvailable: claude | gemini | grok | ollama`);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function providerCredentialHint(name) {
  const hints = {
    claude: 'Set ANTHROPIC_API_KEY in your environment.',
    gemini: 'Set GEMINI_API_KEY in your environment.\n       Also: npm install @google/generative-ai',
    grok:   'Set GROK_API_KEY in your environment.\n       Also: npm install openai',
    ollama: 'Ollama requires no API key.\n       Make sure Ollama is running: https://ollama.com/download',
  };
  return hints[name] ?? 'Check your environment variables.';
}
