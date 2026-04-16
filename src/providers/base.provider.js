/**
 * src/providers/base.provider.js
 *
 * Abstract base class all providers must extend.
 * Defines the contract every provider honours so agents
 * can swap providers without changing a single line of agent code.
 */

export class BaseProvider {
  /**
   * @param {object} config - Provider-specific config (apiKey, baseUrl, etc.)
   */
  constructor(config = {}) {
    if (new.target === BaseProvider) {
      throw new Error('BaseProvider is abstract — extend it with a concrete provider.');
    }
    this.config = config;
  }

  /**
   * Return the model identifiers for each tier.
   * Tiers are provider-agnostic: 'lite', 'standard', 'pro'.
   *
   * @returns {{ lite: string, standard: string, pro: string }}
   */
  getModels() {
    throw new Error(`${this.constructor.name} must implement getModels()`);
  }

  /**
   * Check whether the provider is configured with a valid key / reachable host.
   * Does NOT make a network round-trip — just inspects local config.
   *
   * @returns {boolean}
   */
  validateKey() {
    throw new Error(`${this.constructor.name} must implement validateKey()`);
  }

  /**
   * Send a message list to the model and return the full response with usage.
   *
   * @param {Array<{ role: 'user'|'assistant', content: string }>} messages
   * @param {string} systemPrompt
   * @param {object} options
   * @param {string} options.model      - Resolved model ID
   * @param {number} options.max_tokens
   * @returns {Promise<{ text: string, usage: { inputTokens: number, outputTokens: number } }>}
   */
  async complete(_messages, _systemPrompt, _options = {}) {
    throw new Error(`${this.constructor.name} must implement complete()`);
  }

  /**
   * Same as complete() but yields text chunks as they arrive.
   * Each yielded value is a string fragment.
   *
   * @param {Array<{ role: 'user'|'assistant', content: string }>} messages
   * @param {string} systemPrompt
   * @param {object} options
   * @param {string} options.model
   * @param {number} options.max_tokens
   * @returns {AsyncGenerator<string>}
   */
  // eslint-disable-next-line require-yield
  async *stream(_messages, _systemPrompt, _options = {}) {
    throw new Error(`${this.constructor.name} must implement stream()`);
  }
}
