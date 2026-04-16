/**
 * src/providers/gemini.provider.js
 *
 * Google Gemini provider via @google/generative-ai.
 * Installed on demand — only required if you use this provider:
 *   npm install @google/generative-ai
 *
 * Message format differences vs. Claude/OpenAI:
 *   - Role 'assistant' → 'model'
 *   - Content is Part[] not a plain string
 *   - System prompt goes in systemInstruction, not the message array
 */

import { BaseProvider } from './base.provider.js';

const MODELS = {
  lite:     'gemini-2.0-flash-8b',
  standard: 'gemini-2.0-flash',
  pro:      'gemini-2.0-pro',
};

export class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this._client = null; // lazy-initialized on first call
  }

  getModels() {
    return MODELS;
  }

  validateKey() {
    return Boolean(this.config.apiKey ?? process.env.GEMINI_API_KEY);
  }

  async _getClient() {
    if (this._client) return this._client;

    let GoogleGenerativeAI;
    try {
      ({ GoogleGenerativeAI } = await import('@google/generative-ai'));
    } catch {
      throw new Error(
        'Gemini provider requires @google/generative-ai.\n' +
        'Install it: npm install @google/generative-ai'
      );
    }

    this._client = new GoogleGenerativeAI(
      this.config.apiKey ?? process.env.GEMINI_API_KEY
    );
    return this._client;
  }

  // Gemini uses 'model' for assistant turns, and wraps content in Part arrays
  _toGeminiHistory(messages) {
    return messages.map(({ role, content }) => ({
      role: role === 'assistant' ? 'model' : 'user',
      parts: [{ text: content }],
    }));
  }

  async complete(messages, systemPrompt, options = {}) {
    const { model, max_tokens = 1024 } = options;
    const genAI = await this._getClient();

    const generativeModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
    });

    const history = this._toGeminiHistory(messages.slice(0, -1));
    const last = messages[messages.length - 1];

    const chat = generativeModel.startChat({
      history,
      generationConfig: { maxOutputTokens: max_tokens },
    });

    const result = await chat.sendMessage(last.content);
    const meta   = result.response.usageMetadata ?? {};

    return {
      text: result.response.text(),
      usage: {
        inputTokens:  meta.promptTokenCount     ?? 0,
        outputTokens: meta.candidatesTokenCount ?? 0,
      },
    };
  }

  async *stream(messages, systemPrompt, options = {}) {
    const { model, max_tokens = 1024 } = options;
    const genAI = await this._getClient();

    const generativeModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
    });

    const history = this._toGeminiHistory(messages.slice(0, -1));
    const last = messages[messages.length - 1];

    const chat = generativeModel.startChat({
      history,
      generationConfig: { maxOutputTokens: max_tokens },
    });

    const result = await chat.sendMessageStream(last.content);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }
}
