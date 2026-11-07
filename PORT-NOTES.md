# Port notes: custom gateway feature on stable release v2026.1106.0

Branch `feat/gateway-stable-v2026.1106.0` = upstream stable tag `v2026.1106.0`
(points to upstream commit `d69631b01b`, 2026-10-22) + the 6 damienprz feature
commits cherry-picked from `master` (which itself is upstream master at
`aa58fa107`, 2026-10-30, plus the same feature).

## Why this branch exists

upstream `master` moves fast (canary/nightly tags daily). This branch pins a
*released* snapshot and carries only the custom-gateway feature on top, so a
long-lived deployment can run the NVIDIA NIM / OpenCode Go / local-LLM gateway
workflows without tracking master.

## Ported commits (chronological)

1. `e3f2ee03a4` feat: Add hermetic integration for locally hosted inference models
2. `a14ce718e0` fix(agents): fix typescript type for aiConnectionBinding and dynamic model fetch
3. `873fb26e2d` feat(shared): allow private-network endpoints for local AI provider routing
4. `f7b5718957` feat(ui): add a Local LLM source to the onboarding connect step
5. `3febf930bf` feat(ui): support custom gateway in onboarding and new agent setup (NVIDIA NIM)
6. `c5c1f593a7` fix(ai-gateway): send x-opencode-session on OpenCode gateway model requests

## Conflict resolutions made during the port

- `packages/shared/src/ai-provider-routing.ts` — keep the private-network
  (local) + HTTPS-gateway validation split from our branch.
- `server/src/routes/ai-connections.ts` — added the `POST .../fetch-models`
  route; dropped the ghost `/local` route stub that referenced
  `managementGuard` (that guard does not exist at the tag; the tag already has
  its own `/local` handlers).
- `packages/paperclip-runner/src/drivers/opencode/opencode-server-driver.ts` —
  introduced `providerRoute` (paperclip/openrouter) and `opencodeSessionId`
  wiring; defined `providerEnvironment` locally because the tag predates it.
- `ui/src/components/OnboardingWizard.tsx`, `ai-connections/AiProviderSetup.tsx`,
  `ai-connections/useConnectionModels.ts`, `onboarding/OnboardingGatewaySetup.tsx`
  — carried over from master (the tag predates the onboarding gateway-setup
  component and the `useConnectionModelsState` hook).

## Known degradation (accepted, not used by this deployment)

The tag-era first-onboarding GitHub Copilot flow lives in the tag's wizard;
the master-era wizard restructured it. Copying the master file wholesale
regresseds 9 of the 174 tag tests in
`src/components/OnboardingWizard.test.tsx` (suite “qualified Copilot
onboarding”). No other surfaces changed.

This deployment does not use Copilot (NVIDIA NIM + OpenCode Go only); Copilot
remains configurable through the regular agent / AI-connections pages whose
files are untouched.

## Verification on this branch

- `@paperclipai/shared` vitest: `opencode-gateway.test.ts`, `ai-provider-routing.test.ts` — 14 passed
- `@paperclipai/server` vitest: `ai-provider-routing`, `fast-response-provider`, `prompt-injection-provider` — 79 passed
- `@paperclipai/ui` vitest: `OnboardingWizard.test.tsx` — 165/174 passed (9 failing = Copilot onboarding, documented above)
- Tag baseline (without our commits) has 0 UI test failures before this port and shows the same 9 failures only after our file copies — confirming the degradation is exactly this wizard surface.

Workspace `tsc` in this checkout reports shared pre-existing noise equal to
the tag baseline (unbuilt workspace packages such as plugin-sdk resolve the
same way on both); the port adds no new type errors over the tag.
