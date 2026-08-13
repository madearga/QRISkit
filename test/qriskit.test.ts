import { test, expect } from "bun:test";
import { convertQRIS, crc16, parseQRIS, providerFromGui, validateQRIS } from "../src/index";

// Real static QRIS payload (merchant account + merchant data) from a public Go fixture.
// The fixture's stored CRC was a sample, not self-validating. QRIS CRC is CRC-16/CCITT-FALSE,
// confirmed by the canonical check value 123456789 -> 29B1. We recompute for a self-consistent fixture.
const GOLDEN_PAYLOAD =
  "00020101021126570011ID.DANA.WWW011893600915359232303502095923230350303UMI51440014ID.CO.QRIS.WWW0215ID10243125491310303UMI5204594553033605802ID5916Azhar Byte Store6011Kota Bekasi6105171116304";
const GOLDEN = GOLDEN_PAYLOAD + crc16(GOLDEN_PAYLOAD); // self-consistent static QRIS
// Real Bank-Mandiri-shaped QRIS derived from a live issuer QRIS (Surabaya merchant).
// Merchant identity (PAN, NMID, name, city, postal) masked to dummy values; CRC recomputed.
// Retains real issuer structure (Bank Mandiri tag-26, QRIS tag-51, tag-62 terminal label).
const REAL_SHAPED =
  "00020101021126690021ID.CO.BANKMANDIRI.WWW01189999999999999999990211000000000000303UKE51440014ID.CO.QRIS.WWW0215ID00000000000000303UKE5204274153033605802ID5915Contoh Merchant6007Jakarta61051000062070703A0163040C01";
// Real ShopeePay-shaped QRIS (issuer GUI ID.CO.SHOPEE.WWW, found in tag 40).
// Merchant identity (PAN, name, payment-system-specific token) masked; CRC recomputed.
const SHOPEE_MASKED =
  "00020101021240550016ID.CO.SHOPEE.WWW011800000000000000000002090000000005204482953033605802ID5915Contoh Merchant6015Jakarta Selatan61051000062470804DMCT993500000000000000000000000000000000000630491F3";

test("crc16 matches CRC-16/CCITT-FALSE check value (the QRIS standard)", () => {
  expect(crc16("123456789")).toBe("29B1");
});

test("self-consistent golden QRIS validates", () => {
  expect(validateQRIS(GOLDEN).valid).toBe(true);
});

test("parseQRIS reads golden as static with correct merchant", () => {
  const m = parseQRIS(GOLDEN);
  expect(m.method).toBe("static");
  expect(m.merchantName).toBe("Azhar Byte Store");
  expect(m.merchantCity).toBe("Kota Bekasi");
  expect(m.countryCode).toBe("ID");
  expect(m.currency).toBe("360");
});

test("convertQRIS static → dynamic: result re-validates and carries amount", () => {
  const dyn = convertQRIS(GOLDEN, { amount: 50000 });
  expect(validateQRIS(dyn).valid).toBe(true);
  expect(dyn).toContain("540550000"); // tag 54, len 05, value "50000"
  const m = parseQRIS(dyn);
  expect(m.method).toBe("dynamic");
  expect(m.amount).toBe("50000");
});

test("convertQRIS with fixed fee inserts tip tags and stays valid", () => {
  const dyn = convertQRIS(GOLDEN, { amount: 50000, fee: { type: "fixed", value: 1000 } });
  expect(validateQRIS(dyn).valid).toBe(true);
  expect(dyn).toContain("550202"); // tag 55, len 02, value "02" (fixed)
  expect(dyn).toContain("56041000"); // tag 56, len 04, value "1000"
});

test("convertQRIS with percent fee inserts percent tags and stays valid", () => {
  const dyn = convertQRIS(GOLDEN, { amount: 50000, fee: { type: "percentage", value: 2 } });
  expect(validateQRIS(dyn).valid).toBe(true);
  expect(dyn).toContain("550203"); // tag 55, len 02, value "03" (percent)
  expect(dyn).toContain("57012"); // tag 57, len 01, value "2"
});

test("convertQRIS rejects non-positive amount", () => {
  expect(() => convertQRIS(GOLDEN, { amount: 0 })).toThrow();
  expect(() => convertQRIS(GOLDEN, { amount: -5 })).toThrow();
});

test("validateQRIS rejects a tampered CRC", () => {
  const tampered = GOLDEN.slice(0, -4) + "0000";
  const r = validateQRIS(tampered);
  expect(r.valid).toBe(false);
  expect(r.errors.join(" ")).toMatch(/CRC mismatch/);
});

test("real Bank-Mandiri-shaped QRIS (merchant masked) validates and converts", () => {
  expect(validateQRIS(REAL_SHAPED).valid).toBe(true);
  const meta = parseQRIS(REAL_SHAPED);
  expect(meta.method).toBe("static");
  expect(meta.merchantName).toBe("Contoh Merchant"); // masked, not the real merchant
  expect(meta.merchantCity).toBe("Jakarta");
  const dyn = convertQRIS(REAL_SHAPED, { amount: 12345 });
  expect(validateQRIS(dyn).valid).toBe(true);
  expect(parseQRIS(dyn).amount).toBe("12345");
  expect(parseQRIS(dyn).method).toBe("dynamic");
});

test("provider detection: Bank Mandiri (tag 26)", () => {
  const m = parseQRIS(REAL_SHAPED);
  expect(m.provider).toBe("Bank Mandiri");
  expect(m.issuerGui).toBe("ID.CO.BANKMANDIRI.WWW");
  expect(m.merchantAccountInfo?.tag).toBe("26");
});

test("provider detection: DANA (tag 26)", () => {
  expect(parseQRIS(GOLDEN).provider).toBe("DANA");
});

test("provider detection: ShopeePay (tag 40) + additional data", () => {
  const m = parseQRIS(SHOPEE_MASKED);
  expect(m.provider).toBe("ShopeePay");
  expect(m.issuerGui).toBe("ID.CO.SHOPEE.WWW");
  expect(m.merchantAccountInfo?.tag).toBe("40");
  expect(m.additionalData?.purpose).toBe("DMCT");
  expect(m.additionalData?.paymentSystemSpecific?.["99"]).toBeTruthy();
});

test("additional data: terminalLabel from tag 62 sub-07", () => {
  expect(parseQRIS(REAL_SHAPED).additionalData?.terminalLabel).toBe("A01");
});

test("providerFromGui falls back to raw GUI when unknown", () => {
  expect(providerFromGui("ID.CO.UNKNOWN.WWW")).toBe("ID.CO.UNKNOWN.WWW");
});
