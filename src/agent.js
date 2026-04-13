/**
 * src/agent.js
 *
 * BaseAgent — the foundation every domain agent extends.
 * Delegates all model calls to the active provider so agents
 * work identically regardless of which AI backend is configured.
 */

import taloviConfig from '../config/talovi.config.js';
import { createProvider } from './providers/index.js';

// Singleton provider built from talovi.config.js at import time.
// Agents use this unless a provider is passed explicitly to the constructor.
const _defaultProvider = createProvider(
  taloviConfig.provider,
  taloviConfig.providers[taloviConfig.provider] ?? {}
);

export class BaseAgent {
  /**
   * @param {object} options
   * @param {string} options.domain       - Domain name (for default tier lookup)
   * @param {string} options.systemPrompt - The system prompt for this agent
   * @param {BaseProvider} [options.provider] - Override the global provider for this agent
   */
  constructor({ domain, systemPrompt, provider }) {
    this.domain = domain;
    this.systemPrompt = systemPrompt;
    this.provider = provider ?? _defaultProvider;
  }

  /**
   * Resolve the provider model ID for a given tier.
   * Priority: explicit tier arg → domain default → 'lite'
   *
   * @param {string} [tier] - 'lite' | 'standard' | 'pro'
   * @returns {string} model ID
   */
  resolveModel(tier) {
    const resolved = tier ?? taloviConfig.domainDefaults[this.domain] ?? 'lite';
    const models = this.provider.getModels();
    const model = models[resolved];
    if (!model) {
      throw new Error(
        `Unknown tier "${resolved}". Valid tiers: ${Object.keys(models).join(', ')}`
      );
    }
    return model;
  }

  /**
   * Run the agent on a user message.
   *
   * @param {string} userMessage
   * @param {object} [options]
   * @param {string} [options.tier]       - Override model tier for this call
   * @param {number} [options.max_tokens] - Override max tokens
   * @param {Array}  [options.history]    - Prior turns: [{ role, content }, ...]
   * @returns {Promise<string>}
   */
  async run(userMessage, options = {}) {
    const { tier, max_tokens, history = [] } = options;

    const model = this.resolveModel(tier);
    const maxTok = max_tokens ?? taloviConfig.generationDefaults.max_tokens;

    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    return this.provider.complete(messages, this.systemPrompt, { model, max_tokens: maxTok });
  }

  /**
   * Stream the agent's response, yielding text chunks as they arrive.
   *
   * @param {string} userMessage
   * @param {object} [options] - Same as run()
   * @returns {AsyncGenerator<string>}
   */
  async *stream(userMessage, options = {}) {
    const { tier, max_tokens, history = [] } = options;

    const model = this.resolveModel(tier);
    const maxTok = max_tokens ?? taloviConfig.generationDefaults.max_tokens;

    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    yield* this.provider.stream(messages, this.systemPrompt, { model, max_tokens: maxTok });
  }
}
