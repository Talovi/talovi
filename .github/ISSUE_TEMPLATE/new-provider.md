---
name: New provider
about: Propose a new AI backend provider for Talovi
title: "feat: add [provider-name] provider"
labels: ["new-provider", "needs-discussion"]
assignees: []
---

## Provider name

<!-- The name that will appear in config: provider: '[name]' -->

## Provider type

- [ ] Cloud API (requires API key)
- [ ] Local / self-hosted (no key required)
- [ ] OpenAI-compatible API (uses openai package)
- [ ] Custom SDK / REST

## Why does this provider matter for Talovi's audience?

<!-- Talovi is built for small businesses and disadvantaged developers.
     Explain how this provider helps that audience — lower cost, offline use,
     no data leaving their network, regional availability, free tier, etc. -->

## Model mapping

<!-- Map provider model names to Talovi's three tiers. -->

| Tier | Model ID | Notes |
|------|----------|-------|
| `lite` | | |
| `standard` | | |
| `pro` | | |

## SDK / dependency

<!-- What npm package (if any) is needed?
     If it's optional, describe the install step. -->

- Package name:
- Install command:
- License:

## API compatibility

- [ ] The provider's message format is identical to OpenAI chat completions
- [ ] The provider requires message format translation (describe below)
- [ ] Streaming is supported
- [ ] A free tier or trial is available

## Message format differences (if any)

<!-- Describe any differences from the standard { role, content } format
     so the implementation can be planned accurately. -->

## Credentials

<!-- How does a user obtain credentials?
     Link to the sign-up / API key page. -->

- Sign-up URL:
- Environment variable name(s):
- Any regional or access restrictions:

## Can you implement this?

- [ ] Yes — I'll open a PR
- [ ] Yes — with guidance from a maintainer
- [ ] No — proposing for someone else to implement

## Additional context

<!-- Pricing notes, rate limits, data residency considerations, etc. -->
