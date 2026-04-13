/**
 * talovi.config.js
 *
 * Central configuration for Talovi agents.
 *
 * Provider
 * ────────
 * Change `provider` to switch all agents to a different AI backend.
 * No other code changes required — the abstraction handles the rest.
 *
 *   'claude'  → Anthropic Claude  (requires ANTHROPIC_API_KEY)
 *   'gemini'  → Google Gemini     (requires GEMINI_API_KEY + npm install @google/generative-ai)
 *   'grok'    → xAI Grok          (requires GROK_API_KEY + npm install openai)
 *   'ollama'  → Local Ollama      (no API key — run Ollama on localhost)
 *
 * Tiers
 * ─────
 * Tiers are provider-agnostic labels that map to each provider's model family.
 * The actual model IDs are defined inside each provider file.
 *
 *   lite      → fastest / lowest cost  (FAQs, routing, triage)
 *   standard  → balanced               (most everyday business tasks)
 *   pro       → highest capability     (complex reasoning, sensitive domains)
 */

export const provider = 'claude';

export const providers = {
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  grok: {
    apiKey: process.env.GROK_API_KEY,
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
  },
};

/**
 * Per-domain default tiers.
 * Override per-request by passing { tier: 'pro' } to agent.run().
 */
export const domainDefaults = {
  healthcare:  'standard',   // clinical accuracy matters; upgrade to pro for diagnoses
  legal:       'standard',   // legal reasoning benefits from standard+; pro for complex review
  realestate:  'standard',   // market analysis + negotiation guidance
  retail:      'lite',       // product lookup, FAQs, order status — cost-sensitive
  general:     'lite',       // catch-all; upgrade as needed
};

/**
 * Shared generation defaults applied to every agent call
 * unless overridden at call time.
 */
export const generationDefaults = {
  max_tokens: 1024,
};

/**
 * Safety — keep user data local unless explicitly opted in.
 */
export const privacy = {
  redactPII: true,          // strip obvious PII patterns before sending
  logConversations: false,  // never write conversations to disk by default
};

export default {
  provider,
  providers,
  domainDefaults,
  generationDefaults,
  privacy,
};
