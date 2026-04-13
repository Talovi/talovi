/**
 * examples/demo.js
 *
 * Talovi demo — shows three ways to use the framework:
 *   1. Auto-routing (let Talovi pick the agent)
 *   2. Direct agent use (you pick the domain)
 *   3. Model tier override (use a more capable model for one call)
 *
 * Run:
 *   ANTHROPIC_API_KEY=sk-ant-... node examples/demo.js
 */

import { AgentRouter, RetailAgent, LegalAgent } from '../src/index.js';

const divider = (label) =>
  console.log(`\n${'─'.repeat(60)}\n  ${label}\n${'─'.repeat(60)}`);

async function main() {
  // ── 1. Auto-routing ──────────────────────────────────────────
  divider('1. Auto-routing');

  const router = new AgentRouter();

  const { domain, response: routedResponse } = await router.route(
    'What clauses should I watch out for in a commercial lease?'
  );

  console.log(`Routed to: [${domain}]`);
  console.log(routedResponse);

  // ── 2. Direct agent — Retail ─────────────────────────────────
  divider('2. RetailAgent — customer service reply');

  const retail = new RetailAgent();

  const customerReply = await retail.run(
    'A customer left a 2-star review saying their handmade candle arrived cracked. ' +
    'Write a short, empathetic public response.'
  );

  console.log(customerReply);

  // ── 3. Tier override — Legal with pro model ──────────────────
  divider('3. LegalAgent — pro tier for complex review');

  const legal = new LegalAgent();

  const contractSummary = await legal.run(
    'List the five most important things to check in any independent contractor agreement.',
    { tier: 'pro' }
  );

  console.log(contractSummary);
}

main().catch((err) => {
  console.error('Demo error:', err.message);
  process.exit(1);
});
