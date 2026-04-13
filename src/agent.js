/**
 * src/agent.js
 *
 * BaseAgent — the foundation every domain agent extends.
 * Handles model selection, prompt assembly, and the Anthropic API call.
 */

import Anthropic from '@anthropic-ai/sdk';
import config from '../config/talovi.config.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class BaseAgent {
  /**
   * @param {object} options
   * @param {string} options.domain    - Domain name (used for default tier lookup)
   * @param {string} options.systemPrompt - The system prompt for this agent
   */
  constructor({ domain, systemPrompt }) {
    this.domain = domain;
    this.systemPrompt = systemPrompt;
  }

  /**
   * Resolve the Claude model to use for this call.
   * Priority: explicit tier arg → domain default → 'lite'
   *
   * @param {string} [tier] - 'lite' | 'standard' | 'pro'
   * @returns {string} model ID
   */
  resolveModel(tier) {
    const resolved = tier ?? config.domainDefaults[this.domain] ?? 'lite';
    const model = config.models[resolved];
    if (!model) {
      throw new Error(
        `Unknown tier "${resolved}". Valid tiers: ${Object.keys(config.models).join(', ')}`
      );
    }
    return model;
  }

  /**
   * Run the agent on a user message.
   *
   * @param {string} userMessage - The user's question or instruction
   * @param {object} [options]
   * @param {string} [options.tier] - Override model tier for this call
   * @param {number} [options.max_tokens] - Override max tokens
   * @param {Array}  [options.history] - Prior turns: [{ role, content }, ...]
   * @returns {Promise<string>} The assistant's text response
   */
  async run(userMessage, options = {}) {
    const { tier, max_tokens, history = [] } = options;

    const model = this.resolveModel(tier);
    const maxTok = max_tokens ?? config.generationDefaults.max_tokens;

    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    const response = await client.messages.create({
      model,
      max_tokens: maxTok,
      system: this.systemPrompt,
      messages,
    });

    return response.content[0].text;
  }
}
