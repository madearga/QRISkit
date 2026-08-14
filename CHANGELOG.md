# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- `validateQRIS` now rejects a payload carrying an early or duplicate CRC field (tag 63 before the final position).

### Added
- Robustness suite (`test/robustness.test.ts`): deterministic fuzz proving `validateQRIS` and `crc16` never throw on arbitrary input; `parseQRIS`/`convertQRIS` parse-or-throw cleanly (never corrupt output); TLV round-trip property; duplicate-CRC rejection. 28 tests, 1560 asserts.
- CI: Deno job importing the built ESM and running convert + validate in a non-Node runtime (proves runtime-agnosticism).
- **Docs site** (`docs/`): Astro + Starlight, bilingual (id default / en) — overview, install, API reference, provider detection, comparison, cookbook (Bun/Node/browser/Deno/CF Worker), FAQ. 15 static pages + Pagefind search.

## [0.2.0] - 2026-08-13

### Added
- **Provider detection** — `parseQRIS` now returns `provider` (friendly name) and `issuerGui` from the merchant-account-info tag (26 retail / 40 / 51 cross-border) sub-tag 00. Maps ShopeePay, GoPay, DANA, OVO, Bank Mandiri, BCA, BRI, BNI, QRIS, LinkAja, Xendit; unknown GUIs fall back to the raw string.
- **Rich metadata parse (read-only)** — `parseQRIS` now surfaces `merchantAccountInfo` (gui/pan/criteria/fields) and `additionalData` (tag 62 sub-fields: billNumber, mobileNumber, storeLabel, loyaltyNumber, referenceLabel, customerLabel, terminalLabel, purpose, additionalConsumerDataRequest, merchantTaxId, merchantChannel, payment-system-specific 50–99).
- New `src/provider.ts` (`providerFromGui`, `findMerchantInfo`); new types `MerchantAccountInfo`, `AdditionalData`.
- **CLI** — `qris` binary (`qris convert | validate | info | provider`). Pure `runCli(argv)` logic in `src/cli.ts` (testable); thin `bin/qris.mjs` wrapper over the built `dist/cli.js`.
- Tests: masked ShopeePay fixture (tag 40); provider detection across Mandiri / DANA / ShopeePay; tag-62 terminalLabel + payment-system-specific; unknown-GUI fallback; CLI subcommands + error paths. 22 tests, 47 asserts.

### Notes
- Reconciliation is intentionally **out of scope** — official QRIS reconciliation is server-side (PG/PSP webhook `order_id`), not a string-manipulation library's job.

## [0.1.0] - 2026-08-13

### Added
- `crc16(input)` — CRC-16/CCITT-FALSE (the QRIS/EMVCo CRC), check value `123456789 → 29B1`.
- `parseTLV(input)` / `buildTLV(elements)` — TLV (Tag-Length-Value) parse & build with nested-children support (tags 26–51, 62).
- `convertQRIS(input, { amount, fee? })` — convert static QRIS → dynamic (flip initiation method 11→12, inject Transaction Amount tag 54 + optional fee tags 55/56 or 55/57, recompute CRC16).
- `validateQRIS(input)` → `{ valid, errors }` — structure + CRC16 integrity check.
- `parseQRIS(input)` → human metadata (method, currency, country, merchant name/city, postal code, amount).
- Dual ESM + CJS build via tsup, strict TypeScript, zero runtime dependencies.
- Bun test suite (8 tests) including the canonical CRC check value and a real-structured QRIS fixture.
- Bilingual README (Bahasa Indonesia / English), CI (Bun + Node), Bank Indonesia disclaimer.
