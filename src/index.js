/**
 * src/index.js
 *
 * Talovi public API surface.
 * Import from here — never from internal files directly.
 *
 * Usage:
 *   import { AgentRouter, HealthcareAgent, createAgent } from 'talovi';
 */

export { BaseAgent }       from './agent.js';
export { AgentRouter }     from './router.js';

import { HealthcareAgent } from '../agents/healthcare.js';
import { LegalAgent }      from '../agents/legal.js';
import { RealEstateAgent } from '../agents/realestate.js';
import { RetailAgent }     from '../agents/retail.js';
import { GeneralAgent }    from '../agents/general.js';

export { HealthcareAgent, LegalAgent, RealEstateAgent, RetailAgent, GeneralAgent };

export { default as config } from '../config/talovi.config.js';

/**
 * Convenience factory — create a named domain agent without importing it directly.
 *
 * @param {'healthcare'|'legal'|'realestate'|'retail'|'general'} domain
 * @returns {BaseAgent}
 */
export function createAgent(domain) {
  const map = {
    healthcare: () => new HealthcareAgent(),
    legal:      () => new LegalAgent(),
    realestate: () => new RealEstateAgent(),
    retail:     () => new RetailAgent(),
    general:    () => new GeneralAgent(),
  };

  if (!map[domain]) {
    throw new Error(`Unknown domain "${domain}". Valid: ${Object.keys(map).join(', ')}`);
  }

  return map[domain]();
}
