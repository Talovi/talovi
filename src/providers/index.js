/**
 * src/providers/index.js
 *
 * Provider factory and registry.
 * Add new providers here — agents pick them up automatically.
 */

import { ClaudeProvider }  from './claude.provider.js';
import { GeminiProvider }  from './gemini.provider.js';
import { GrokProvider }    from './grok.provider.js';
import { OllamaProvider }  from './ollama.provider.js';
import { OpenAIProvider }  from './openai.provider.js';
import { BaseProvider }    from './base.provider.js';

const REGISTRY = {
  claude: ClaudeProvider,
  gemini: GeminiProvider,
  grok:   GrokProvider,
  ollama: OllamaProvider,
  openai: OpenAIProvider,
};

/**
 * Instantiate a provider by name.
 *
 * @param {string} name   - 'claude' | 'gemini' | 'grok' | 'ollama' | 'openai'
 * @param {object} config - Provider-specific config (apiKey, baseUrl, etc.)
 * @returns {BaseProvider}
 */
export function createProvider(name, config = {}) {
  const Provider = REGISTRY[name];
  if (!Provider) {
    throw new Error(
      `Unknown provider "${name}". Available: ${Object.keys(REGISTRY).join(', ')}`
    );
  }
  return new Provider(config);
}

export { ClaudeProvider, GeminiProvider, GrokProvider, OllamaProvider, OpenAIProvider, BaseProvider };
