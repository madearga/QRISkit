# Roadmap

Ideation source: `IDEATION.md` (ce-ideate survivors). v0.1 ships **S1 (core) + S3 (docs) + S6 (trust)**.

## Planned (post-v0.1)

- **S2 — Unique payment code + provider detection.** First-class tag-62 `referenceLabel` / unique-code injection for reconciliation, and merchant provider detection (DANA / GoPay / OVO / ShopeePay / Bank Indonesia generic) returned as metadata. Only `@shamah/dynamic-qris` partially covers this today.
- **S4 — Interactive no-backend demo site.** Browser-only QRIS playground proving the runtime-agnostic claim live.
- **S5 — Opt-in addon packages.** `@qriskit/render` (QR image, thin `qrcode` wrapper) and `@qriskit/react` (hook / component), kept out of the zero-dep core.
- **CLI** — a `qris convert | validate | info` binary (the experiment in `../qris-bun` already has a working prototype).
- **CI expansion** — Deno + Cloudflare Workers smoke jobs; property-based / fuzz testing against real BI QRIS samples.
- **Docs site** — Astro + Starlight (none of the 20+ QRIS packages have one).

## Out of scope (YAGNI)

- QR image rendering in core (exists in several packages → addon only).
- Payment gateway / PJSP integration (covered by gateway SDKs; out of scope for a string-math tool).
- Framework-specific middleware (Hono / Astro) without concrete demand.
