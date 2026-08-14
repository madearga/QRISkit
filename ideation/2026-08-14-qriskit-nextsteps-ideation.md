# qriskit Next Steps — Ideation (continuation)

- **Date:** 2026-08-14 · **Skill:** ce-ideate · **Resume of:** `~/Desktop/qris-bun/IDEATION.md` (2026-08-13)
- **Process note:** grounding run in-thread by the author who built qriskit this session (no separate scout — I am the author); fresh web research skipped (prior external context is 1 day old and still valid; this subject is internal-forward). Divergent ideation + critique = single orchestrator-context pass (not independently corroborated). Format = markdown (resumes the prior `.md`).

## Prior survivors → status

| Survivor | Status |
|---|---|
| S1 core (noble-* of QRIS) | ✅ v0.1.0 |
| S2 unique-code + provider detection | ⚠️ Provider detection ✅ v0.2.0; unique-code **dropped** — research proved reconciliation is server-side (PG/PSP webhook), not a string library's job |
| S3 docs site (bilingual ID/EN) | ❌ Open — only a bilingual README exists |
| S4 interactive no-backend demo | ✅ Built (TanStack Start, pure-client) — **not yet deployed** |
| S5 opt-in addons (render / react) | ❌ Open |
| S6 trust & maintenance | ⚠️ CI (Bun+Node+typecheck), semver, CHANGELOG, CRC proof, comparison table, BI disclaimer ✅; Deno/CF-Workers CI + fuzz/property tests ❌ |
| (extra) CLI | ✅ Built |

**Current state:** repo `madearga/QRISkit` = library v0.2.0 (convert/validate/parse + provider detection + rich tag-62 parse) + CLI (`qris`) + demo web. All pushed to `main`, **unreleased to npm**, demo not deployed.

## New axes (what aspects to think on next)

1. **Distribution / getting it out** · 2. **Documentation & trust** · 3. **Feature surface & addons** · 4. **Adoption & growth**

## Survivors (6) for next steps

### N1 — Ship it: npm publish + deploy demo + GitHub hygiene ⭐ immediate
Release `qriskit@0.2.0` to npm (unblocks the CLI + library for real `npm install`/`npx`), deploy the demo to Vercel + link it from README/repo, enable GitHub Actions (green CI badge), add repo topics (`qris`, `typescript`, `payment`). Turns a repo into a *usable, visible* open-source project. The spearhead is npm publish.

### N2 — Docs site (Astro/Starlight, bilingual ID/EN) — biggest remaining gap
**None of the 20+ QRIS packages have a docs site.** Include API reference (TypeDoc), the comparison table as a page, and examples/cookbook (Bun / Node / browser / Cloudflare Worker). Turns "a library with a README" into "the QRIS library." High value, higher effort.

### N3 — Hardening + trust rigor (CI expansion + fuzz + validator fix + badges)
Add Deno + Cloudflare Workers smoke CI (proves the runtime-agnostic claim), property/fuzz tests over TLV + CRC (real fixtures already pass; fuzz catches edge cases), fix the known **duplicate-CRC validator gap** (a payload with an early `6304` currently passes — found while masking), and bundle-size/bench badges. Backs the "alive + maintained" moat.

### N4 — Demo quality: strengthen the Upload-QR decoder (+ optional camera scan)
The demo's `jsqr` decode is flaky on phone photos (proved earlier — needed grayscale/threshold/resize preprocessing on a screenshot). Add that preprocessing + optional camera scan so the demo works from a real phone photo, not just clean screenshots. Cheap, high UX value.

### N5 — Open-source health: CONTRIBUTING + real-case showcase
`CONTRIBUTING.md`, issue/PR templates, GitHub Discussions, and a documented "verified against real issuers" showcase (Bank Mandiri, ShopeePay, DANA — you tested them live). Real data is a credibility asset competitors lack.

### N6 — `@qriskit/render` opt-in addon (QR image for library consumers)
The demo renders QR via `qrcode`, but library consumers who want qriskit to *emit a scannable QR image* need an opt-in `@qriskit/render` addon (keeps core zero-dep). **Defer until a concrete consumer asks** (ponytail) — `@qriskit/react` stays dropped (no demand; a React adapter already exists elsewhere).

## Recommended next (v0.3)

**N1 (ship it) first** — it unblocks everything (npm install of CLI+lib, live demo URL, visible project). Then **N3** (hardening — cheap, backs the trust moat) or **N4** (demo decoder) as the quick follow, with **N2** (docs site) as the larger strategic investment after.

## Next-step menu (ce-ideate → handoff)

- **A.** Pick one survivor → `ce-brainstorm` to define it → `ce-plan` to build.
- **B.** Commit to the v0.3 push (N1 ship it) → execute directly.
- **C.** Stop here — ideation is enough for now.
