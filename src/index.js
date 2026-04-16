/**
 * src/index.js
 *
 * Talovi public API surface.
 * Always import from here — never from internal paths directly.
 *
 * Usage:
 *   import { AgentRouter, HealthcareAgent, createAgent, createProvider } from 'talovi';
 */

// ── Core ──────────────────────────────────────────────────────────────────────
import { BaseAgent }       from './agent.js';
import { AgentRouter }     from './router.js';
import { CostTracker, PRICING } from './cost.js';
import { getStrings, resolveLang, SUPPORTED_LANGS, TRANSLATIONS } from './translations.js';

// ── Providers ─────────────────────────────────────────────────────────────────
import { createProvider, BaseProvider,
         ClaudeProvider, GeminiProvider,
         GrokProvider, OllamaProvider,
         OpenAIProvider }               from './providers/index.js';

// ── Domain agents ─────────────────────────────────────────────────────────────
import { HealthcareAgent } from '../agents/healthcare.js';
import { LegalAgent }      from '../agents/legal.js';
import { RealEstateAgent } from '../agents/realestate.js';
import { RetailAgent }     from '../agents/retail.js';
import { GeneralAgent }    from '../agents/general.js';

// ── Config ────────────────────────────────────────────────────────────────────
import config from '../config/talovi.config.js';

export {
  // core
  BaseAgent,
  AgentRouter,
  // cost tracking
  CostTracker,
  PRICING,
  // providers
  createProvider,
  BaseProvider,
  ClaudeProvider,
  GeminiProvider,
  GrokProvider,
  OllamaProvider,
  OpenAIProvider,
  // domain agents
  HealthcareAgent,
  LegalAgent,
  RealEstateAgent,
  RetailAgent,
  GeneralAgent,
  // i18n
  getStrings,
  resolveLang,
  SUPPORTED_LANGS,
  TRANSLATIONS,
  // config
  config,
};

/**
 * Convenience factory — create a named domain agent without importing it directly.
 * Pass options (e.g. { provider }) as the second argument to override defaults.
 *
 * @param {'healthcare'|'legal'|'realestate'|'retail'|'general'} domain
 * @param {object} [options] - Forwarded to the agent constructor (e.g. { provider, tier })
 * @returns {BaseAgent}
 */
export function createAgent(domain, options = {}) {
  const map = {
    healthcare: () => new HealthcareAgent(options),
    legal:      () => new LegalAgent(options),
    realestate: () => new RealEstateAgent(options),
    retail:     () => new RetailAgent(options),
    general:    () => new GeneralAgent(options),
  };

  if (!map[domain]) {
    throw new Error(`Unknown domain "${domain}". Valid: ${Object.keys(map).join(', ')}`);
  }

  return map[domain]();
}
