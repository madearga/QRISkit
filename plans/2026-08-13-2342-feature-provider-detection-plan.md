# Provider Detection & Rich Metadata Parse - Plan

- artifact_contract: ce-unified-plan/v1
- artifact_readiness: requirements-only
- product_contract_source: ce-brainstorm
- date: 2026-08-13

## Goal Capsule

- **Objective:** Add read-only **provider detection** + **rich additional-data / merchant-info parsing** to qriskit, so `parseQRIS` surfaces the payment provider and all structured tag-62 sub-fields.
- **Product authority:** Captain approved **"metadata-only"** scope — no reconciliation claims, no kode unik, no tag-62 write.
- **Open blockers:** none. Real issuer data on hand: ShopeePay (tag 40), Bank Mandiri (tag 26), DANA (tag 26).

## Product Contract

### Requirements

1. **Provider detection**
   - Locate the merchant-account-info tag — check **26** (retail), **40** (observed on ShopeePay), **51** (QRIS cross-border); first found wins.
   - Read sub-tag **00** (Globally Unique Identifier / GUI).
   - Map known Indonesian GUIs → friendly provider name (initial set, extensible):
     - `ID.CO.SHOPEE.WWW` → ShopeePay
     - `COM.GO-JEK.WWW` / `ID.GO-JEK.WWW` → GoPay
     - `ID.DANA.WWW` → DANA
     - `ID.OVO.WWW` → OVO
     - `ID.CO.BANKMANDIRI.WWW` → Bank Mandiri
     - `ID.CO.BCA.WWW` → BCA
     - `ID.CO.QRIS.WWW` → QRIS (generic)
     - `ID.LINKAJA.WWW` → LinkAja
   - **Fallback:** unknown GUI → return the raw GUI string (or `"unknown"`); never throw.
   - The map is maintained data, **not** authoritative BI-registry verification.

2. **Rich additional-data parse (tag 62)** — read-only
   - Surface sub-fields: `01` billNumber, `02` mobileNumber, `03` storeLabel, `04` loyaltyNumber, `05` referenceLabel, `06` customerLabel, `07` terminalLabel, `08` purpose, `09` additionalConsumerDataRequest, `10` merchantTaxId, `11` merchantChannel, `50–99` paymentSystemSpecific (as raw key→value entries).

3. **Merchant account info** sub-fields surfaced (GUI, PAN, criteria) for inspection.

4. **Backward compatible:** `parseQRIS` output **adds** fields; existing callers unaffected.

### Out of scope (v0.2)

- **Kode unik / amount suffix** — dropped; not official QRIS reconciliation.
- **Tag-62 write / reference-label injection** — cosmetic-only; deferred.
- **Any reconciliation claim** — server-side PG webhook is authoritative, not the library.
- QR rendering; provider registry verification against Bank Indonesia.

### Key decisions

- Provider map is maintained in-repo, case-insensitive normalized matching, easily extensible.
- Detection order: **26 → 40 → 51** (first merchant-info tag found).
- Output shape: extend `QrisMeta` with `provider` / `issuerGui`; add structured `additionalData` + `merchantAccountInfo`. Exact field names deferred to planning.

### Acceptance examples

- `parseQRIS(MANDIRI_FIXTURE).provider === "Bank Mandiri"`
- `parseQRIS(SHOPEE_FIXTURE).provider === "ShopeePay"`
- `parseQRIS(DANA_GOLDEN).provider === "DANA"`
- Unknown GUI → `provider` = raw GUI string (does not throw)
- ShopeePay tag-62 sub-99 appears in `paymentSystemSpecific`; Warkop `terminalLabel === "A01"`

### Open questions

- None blocking. Field-name shape left to `ce-plan`.

## Implementation units (light, for ce-plan)

- `src/provider.ts` — GUI→provider map + `detect(elements)`.
- `src/types.ts` — extend `QrisMeta`; add `AdditionalData` + `MerchantAccountInfo` types.
- `src/meta.ts` — `parseQRIS` calls provider detect + surfaces tag-62 sub-fields + merchant-info.
- `test/` — add masked ShopeePay fixture; assert provider + tag-62 parse across Mandiri / DANA / ShopeePay fixtures.

## Verification note

Grounding and claim verification were run **in-thread by the author who built qriskit this session** (not independently corroborated — per INDEPENDENCE_ACCOUNTING). Claims verified against this session's evidence: `parseTLV` nests tags 26–51 and 62 (confirmed by the Bank Mandiri and ShopeePay TLV trees); `parseQRIS` does not yet surface provider or tag-62 (current `meta.ts` reads only top-level tags); provider GUI appears in tag 26 (Mandiri/DANA) and tag 40 (ShopeePay).
