# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
