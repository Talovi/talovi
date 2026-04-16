/**
 * src/providers/grok.provider.js
 *
 * xAI Grok provider — uses the OpenAI-compatible REST API at api.x.ai.
 * Requires the openai package (installed on demand):
 *   npm install openai
 *
 * Message format is identical to OpenAI chat completions.
 * System prompt is prepended as a { role: 'system' } message.
 */

import { BaseProvider } from './base.provider.js';

const MODELS = {
  lite:     'grok-3-fast',
  standard: 'grok-3',
  pro:      'grok-3-heavy',
};

const BASE_URL = 'https://api.x.ai/v1';

export class GrokProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this._client = null; // lazy-initialized on first call
  }

  getModels() {
    return MODELS;
  }

  validateKey() {
    return Boolean(this.config.apiKey ?? process.env.GROK_API_KEY);
  }

  async _getClient() {
    if (this._client) return this._client;

    let OpenAI;
    try {
      ({ default: OpenAI } = await import('openai'));
    } catch {
      throw new Error(
        'Grok provider requires the openai package.\n' +
        'Install it: npm install openai'
      );
    }

    this._client = new OpenAI({
      apiKey: this.config.apiKey ?? process.env.GROK_API_KEY,
      baseURL: BASE_URL,
    });
    return this._client;
  }

  _buildMessages(messages, systemPrompt) {
    const result = [];
    if (systemPrompt) result.push({ role: 'system', content: systemPrompt });
    return result.concat(messages);
  }

  async complete(messages, systemPrompt, options = {}) {
    const { model, max_tokens = 1024 } = options;
    const client = await this._getClient();

    const response = await client.chat.completions.create({
      model,
      max_tokens,
      messages: this._buildMessages(messages, systemPrompt),
    });

    return {
      text: response.choices[0].message.content,
      usage: {
        inputTokens:  response.usage?.prompt_tokens     ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }

  async *stream(messages, systemPrompt, options = {}) {
    const { model, max_tokens = 1024 } = options;
    const client = await this._getClient();

    const stream = await client.chat.completions.create({
      model,
      max_tokens,
      messages: this._buildMessages(messages, systemPrompt),
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
