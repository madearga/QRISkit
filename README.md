# qriskit

> Toolkit TypeScript nol-dependensi & runtime-agnostik untuk **QRIS** (Quick Response Code Indonesian Standard).
> A zero-dependency, runtime-agnostic TypeScript toolkit for **QRIS**.

[![CI](https://github.com/madearga/qriskit/actions/workflows/ci.yml/badge.svg)](https://github.com/madearga/qriskit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/qriskit)](https://www.npmjs.com/package/qriskit)
[![license](https://img.shields.io/npm/l/qriskit)](./LICENSE)
[![types](https://img.shields.io/npm/types/qriskit)](https://www.npmjs.com/package/qriskit)

Parse, validate, dan konversi payload QRIS **statis → dinamis**. Berjalan di **Bun, Node, browser, Deno, dan edge runtime** (Cloudflare Workers). Tidak memproses pembayaran — hanya memanipulasi string payload QRIS untuk keperluan tampilan/encoding.

---

## 🇮🇩 Bahasa Indonesia

### Pasang

```bash
bun add qriskit
# atau
npm install qriskit
```

### Pakai

```ts
import { convertQRIS, validateQRIS, parseQRIS } from "qriskit";

const statis = "00020101021126...6304XXXX"; // QRIS statis milikmu

// Statis → Dinamis (injek nominal + opsional biaya)
const dinamis = convertQRIS(statis, { amount: 75000 });
const denganBiaya = convertQRIS(statis, {
  amount: 75000,
  fee: { type: "fixed", value: 1000 }, // atau { type: "percentage", value: 2 }
});

// Validasi struktur + CRC16
const { valid, errors } = validateQRIS(dinamis);

// Baca metadata merchant
const meta = parseQRIS(dinamis);
// { method: "dynamic", merchantName: "...", merchantCity: "...", amount: "75000", ... }
```

### API

| Fungsi | Keterangan |
|--------|------------|
| `convertQRIS(qris, { amount, fee? })` | Konversi statis → dinamis, hitung ulang CRC16. |
| `validateQRIS(qris)` → `{ valid, errors }` | Cek struktur + integritas CRC16. |
| `parseQRIS(qris)` → `QrisMeta` | Metadata lengkap: method, currency, **provider**, merchant info, additional data (tag 62), nominal. |
| `parseTLV(qris)` / `buildTLV(elements)` | TLV tingkat lanjut (parse / susun, dukung nested). |
| `crc16(str)` | CRC-16/CCITT-FALSE (CRC standar QRIS). |
| `providerFromGui(gui)` | Nama provider ramah dari GUI (mis. `ShopeePay`), atau GUI mentah jika tak dikenal. |

---

## 🇬🇧 English

### Install

```bash
bun add qriskit   # or: npm install qriskit
```

### Usage

```ts
import { convertQRIS, validateQRIS, parseQRIS } from "qriskit";

const staticQris = "00020101021126...6304XXXX"; // your static QRIS

// Static → Dynamic (inject amount + optional fee, recompute CRC16)
const dynamic = convertQRIS(staticQris, { amount: 75000 });
const withFee = convertQRIS(staticQris, {
  amount: 75000,
  fee: { type: "fixed", value: 1000 }, // or { type: "percentage", value: 2 }
});

const { valid, errors } = validateQRIS(dynamic);
const meta = parseQRIS(dynamic);
```

See the API table above. Full types are shipped (`QrisMeta`, `ConvertOptions`, `ValidationResult`, `TLV`).

---

## Deteksi provider / Provider detection

```ts
const m = parseQRIS(qris);
m.provider;             // "ShopeePay" | "DANA" | "Bank Mandiri" | … | raw GUI
m.issuerGui;            // "ID.CO.SHOPEE.WWW"
m.merchantAccountInfo;  // { tag: "40", gui, pan?, criteria?, fields }
m.additionalData;       // { terminalLabel?, referenceLabel?, purpose?, paymentSystemSpecific?, … }
```

Provider dikenali secara **read-only** (bukan verifikasi registry Bank Indonesia): ShopeePay, GoPay, DANA, OVO, Bank Mandiri, BCA, BRI, BNI, LinkAja, Xendit, QRIS (generic). GUI tak dikenal dikembalikan apa adanya — tanpa throw. Tervalidasi di data issuer nyata: ShopeePay (tag 40), Bank Mandiri & DANA (tag 26).

## Kenapa qriskit? / Why qriskit?
## Kenapa qriskit? / Why qriskit?

- **Zero runtime dependencies** — kode murni, tidak ada pohon dependensi yang membengkak.
- **Runtime-agnostik** — Bun, Node, browser, Deno, Cloudflare Workers. Tidak ada API Node.
- **Tree-shakeable ESM + CJS** — ukuran kecil, bundler-friendly.
- **Strict TypeScript** — tipe lengkap, `strict` mode.
- **CRC16 terverifikasi** — algoritma byte-identik dengan `verssache/qris-dinamis`; nilai uji kanonik `crc16("123456789") === "29B1"`.

### Perbandingan / Comparison

| | qriskit | `@prasetya/qris` | `@shamah/dynamic-qris` | `@fhylabs/qris-dynamic` | `qris-dinamis` (razisek) |
|---|:---:|:---:|:---:|:---:|:---:|
| Zero runtime deps | ✅ | ✅ | ✅ | ❌ (canvas, jimp, qrcode) | ❌ |
| Runtime-agnostic (browser/edge/Deno) | ✅ | ❌ Node | ❌ Node | ❌ Node | ❌ Node |
| Tree-shakeable ESM + CJS | ✅ | ✅ | ✅ | ❌ | ❌ |
| Strict TypeScript + types | ✅ | ✅ | ✅ | ✅ | ❌ (JS) |
| Validate + CRC check | ✅ | ✅ | ✅ | ❌ | ❌ |
| Actively maintained (2026) | ✅ | ✅ | ✅ | ⚠️ | ❌ (stale 2024) |

> Tabel ini disusun dari riset publik (npm + GitHub) per 2026-08. Buka [Issues](https://github.com/madearga/qriskit/issues) bila ada data yang perlu diperbarui.

---

## Pengembangan / Development

```bash
bun install
bun test            # 8 tests
bun run build       # tsup → dist/ (ESM + CJS + .d.ts)
bun run typecheck
```

## Roadmap

Unique-payment-code (tag-62) + provider detection, demo site tanpa-backend, addon paket (`@qriskit/render`, `@qriskit/react`), CLI, situs dokumentasi (Astro/Starlight). Lihat [ROADMAP.md](./ROADMAP.md).

## Disclaimer

**"QRIS" adalah merek dagang terdaftar Bank Indonesia.** Proyek ini independen, **tidak berafiliasi, tidak didukung, dan tidak disponsori oleh Bank Indonesia.** Library ini hanya melakukan manipulasi string payload QRIS (parse / validate / encode) untuk keperluan tampilan dan **tidak memproses pembayaran, tidak memindahkan dana, dan tidak menjalankan sistem pembayaran.**

**"QRIS" is a registered mark of Bank Indonesia.** This is an independent community project, **not affiliated with, endorsed by, or sponsored by Bank Indonesia.** It performs QRIS payload string manipulation for display purposes only and does not process payments, move funds, or operate a payment system.

## License

[MIT](./LICENSE)
