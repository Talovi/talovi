/**
 * src/providers/claude.provider.js
 *
 * Anthropic Claude provider — the original Talovi backend.
 * Uses @anthropic-ai/sdk (already a required dependency).
 */

import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.provider.js';

const MODELS = {
  lite:     'claude-haiku-4-5-20251001',
  standard: 'claude-sonnet-4-6',
  pro:      'claude-opus-4-6',
};

export class ClaudeProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    // apiKey falls back to ANTHROPIC_API_KEY env var (Anthropic SDK default)
    this._client = new Anthropic({ apiKey: config.apiKey });
  }

  getModels() {
    return MODELS;
  }

  validateKey() {
    return Boolean(this.config.apiKey ?? process.env.ANTHROPIC_API_KEY);
  }

  async complete(messages, systemPrompt, options = {}) {
    const { model, max_tokens = 1024 } = options;

    const response = await this._client.messages.create({
      model,
      max_tokens,
      system: systemPrompt,
      messages,
    });

    return response.content[0].text;
  }

  async *stream(messages, systemPrompt, options = {}) {
    const { model, max_tokens = 1024 } = options;

    const stream = this._client.messages.stream({
      model,
      max_tokens,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
