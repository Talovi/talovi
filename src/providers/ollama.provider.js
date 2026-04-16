/**
 * src/providers/ollama.provider.js
 *
 * Local Ollama provider — no API key required, no extra npm packages.
 * Uses native fetch (Node 18+) against the Ollama REST API.
 *
 * Start Ollama: https://ollama.com/download
 * Pull a model:  ollama pull llama3
 *
 * Default base URL: http://localhost:11434
 * Override via config: { baseUrl: 'http://my-server:11434' }
 */

import { BaseProvider } from './base.provider.js';

const MODELS = {
  lite:     'llama3:8b',
  standard: 'llama3',
  pro:      'llama3:70b',
};

export class OllamaProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.baseUrl = config.baseUrl ?? 'http://localhost:11434';
  }

  getModels() {
    return MODELS;
  }

  validateKey() {
    return true; // Ollama is local — no API key required
  }

  _buildMessages(messages, systemPrompt) {
    const result = [];
    if (systemPrompt) result.push({ role: 'system', content: systemPrompt });
    return result.concat(messages);
  }

  async complete(messages, systemPrompt, options = {}) {
    const { model } = options;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: this._buildMessages(messages, systemPrompt),
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama error ${response.status}: ${body}`);
    }

    const data = await response.json();

    return {
      text: data.message.content,
      usage: {
        inputTokens:  data.prompt_eval_count ?? 0,
        outputTokens: data.eval_count        ?? 0,
      },
    };
  }

  async *stream(messages, systemPrompt, options = {}) {
    const { model } = options;

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: this._buildMessages(messages, systemPrompt),
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama error ${response.status}: ${body}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const chunk = JSON.parse(line);
          if (chunk.message?.content) yield chunk.message.content;
          if (chunk.done) return;
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
