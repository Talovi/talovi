/**
 * src/cost.js
 *
 * Cost tracking for Talovi API usage.
 * All calculations happen client-side — nothing is ever sent anywhere.
 *
 * Usage:
 *   import { CostTracker, PRICING } from 'talovi';
 *
 *   const tracker = new CostTracker('claude');
 *   const { text, cost, usage } = await agent.run('Hello');
 *   const msgCost = tracker.record(usage.inputTokens, usage.outputTokens);
 *   console.log(tracker.summary());
 */

// ── Provider pricing (per token) ─────────────────────────────────────────────
// Update these constants when providers change their rates.
export const PRICING = {
  claude: { input: 0.000003,  output: 0.000015 },
  gemini: { input: 0.000001,  output: 0.000002 },
  grok:   { input: 0.000005,  output: 0.000015 },
  ollama: { input: 0.0,       output: 0.0       }, // local — always free
};

export class CostTracker {
  /**
   * @param {string} provider - One of: 'claude' | 'gemini' | 'grok' | 'ollama'
   */
  constructor(provider = 'claude') {
    if (!PRICING[provider]) {
      throw new Error(
        `Unknown provider "${provider}" for cost tracking. ` +
        `Valid providers: ${Object.keys(PRICING).join(', ')}`
      );
    }
    this.provider            = provider;
    this.sessionCost         = 0;
    this.sessionInputTokens  = 0;
    this.sessionOutputTokens = 0;
    this.messageCount        = 0;
  }

  /**
   * Calculate cost for a single API response without recording it.
   *
   * @param {number} inputTokens
   * @param {number} outputTokens
   * @returns {number} cost in USD
   */
  calculate(inputTokens, outputTokens) {
    const rates = PRICING[this.provider];
    return (inputTokens * rates.input) + (outputTokens * rates.output);
  }

  /**
   * Record usage from an API response and add to session totals.
   *
   * @param {number} inputTokens
   * @param {number} outputTokens
   * @returns {number} cost for this message in USD
   */
  record(inputTokens, outputTokens) {
    const cost = this.calculate(inputTokens, outputTokens);
    this.sessionCost         += cost;
    this.sessionInputTokens  += inputTokens;
    this.sessionOutputTokens += outputTokens;
    this.messageCount        += 1;
    return cost;
  }

  /**
   * Format a USD cost value.
   * Always shows at least 4 decimal places so small amounts
   * don't display as $0.0000 when there's a real charge.
   *
   * @param {number} cost
   * @returns {string} e.g. '$0.0032' or '$0.000015'
   */
  static format(cost) {
    if (cost === 0) return '$0.0000';
    // Use enough decimal places to show at least 2 significant figures
    const magnitude = Math.floor(Math.log10(cost));
    const decimals  = Math.max(4, -magnitude + 1);
    return '$' + cost.toFixed(decimals);
  }

  /**
   * Summary of the current session.
   *
   * @returns {{ sessionCost: number, inputTokens: number, outputTokens: number, messageCount: number, formatted: string }}
   */
  summary() {
    return {
      sessionCost:  this.sessionCost,
      inputTokens:  this.sessionInputTokens,
      outputTokens: this.sessionOutputTokens,
      messageCount: this.messageCount,
      formatted:    CostTracker.format(this.sessionCost),
    };
  }

  /** Reset session totals (does not affect any external storage). */
  reset() {
    this.sessionCost         = 0;
    this.sessionInputTokens  = 0;
    this.sessionOutputTokens = 0;
    this.messageCount        = 0;
  }
}
