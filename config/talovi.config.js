/**
 * talovi.config.js
 *
 * Central configuration for Talovi agents.
 * Tiered model support lets you balance capability against cost —
 * critical for small businesses and resource-constrained developers.
 *
 * Tiers:
 *   lite    → Claude Haiku   (fastest, lowest cost — great for FAQs, routing, triage)
 *   standard → Claude Sonnet (balanced — most everyday business tasks)
 *   pro     → Claude Opus    (highest capability — complex reasoning, sensitive domains)
 */

export const models = {
  lite:     'claude-haiku-4-5-20251001',
  standard: 'claude-sonnet-4-6',
  pro:      'claude-opus-4-6',
};

/**
 * Per-domain default tiers.
 * Override per-request by passing { tier: 'pro' } to agent.run().
 */
export const domainDefaults = {
  healthcare:  'standard',   // clinical accuracy matters; upgrade to pro for diagnoses
  legal:       'standard',   // legal reasoning benefits from Sonnet+; pro for complex review
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
  temperature: undefined,   // let Claude use its default per model
};

/**
 * Safety — keep user data local unless explicitly opted in.
 * Set TALOVI_SEND_CONTEXT=1 in your environment to allow
 * full conversation context to be sent to the API.
 */
export const privacy = {
  redactPII: true,          // strip obvious PII patterns before sending
  logConversations: false,  // never write conversations to disk by default
};

export default {
  models,
  domainDefaults,
  generationDefaults,
  privacy,
};
