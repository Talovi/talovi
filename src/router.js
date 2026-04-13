/**
 * src/router.js
 *
 * AgentRouter — automatically dispatches a user message to the
 * most appropriate domain agent based on simple keyword signals.
 *
 * For small businesses that don't want to hard-wire a domain,
 * the router provides a zero-configuration entry point.
 */

import { HealthcareAgent }  from '../agents/healthcare.js';
import { LegalAgent }       from '../agents/legal.js';
import { RealEstateAgent }  from '../agents/realestate.js';
import { RetailAgent }      from '../agents/retail.js';
import { GeneralAgent }     from '../agents/general.js';

const DOMAIN_SIGNALS = [
  {
    agent: new HealthcareAgent(),
    keywords: [
      'symptom', 'diagnosis', 'medication', 'patient', 'clinic',
      'health', 'doctor', 'nurse', 'hospital', 'prescription',
    ],
  },
  {
    agent: new LegalAgent(),
    keywords: [
      'contract', 'lawsuit', 'legal', 'attorney', 'liability',
      'compliance', 'regulation', 'agreement', 'clause', 'court',
    ],
  },
  {
    agent: new RealEstateAgent(),
    keywords: [
      'property', 'listing', 'mortgage', 'lease', 'rent',
      'real estate', 'home', 'house', 'buy', 'sell', 'agent',
    ],
  },
  {
    agent: new RetailAgent(),
    keywords: [
      'order', 'product', 'price', 'inventory', 'store',
      'shipping', 'return', 'refund', 'purchase', 'cart',
    ],
  },
];

const fallback = new GeneralAgent();

/**
 * Score a message against a keyword list.
 * Returns the number of keyword hits.
 */
function score(message, keywords) {
  const lower = message.toLowerCase();
  return keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
}

export class AgentRouter {
  /**
   * Pick the best agent for a message and run it.
   *
   * @param {string} userMessage
   * @param {object} [options] - Passed through to agent.run()
   * @returns {Promise<{ domain: string, response: string }>}
   */
  async route(userMessage, options = {}) {
    let best = { agent: fallback, hits: 0 };

    for (const { agent, keywords } of DOMAIN_SIGNALS) {
      const hits = score(userMessage, keywords);
      if (hits > best.hits) {
        best = { agent, hits };
      }
    }

    const response = await best.agent.run(userMessage, options);
    return { domain: best.agent.domain, response };
  }
}
