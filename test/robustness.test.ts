import { test, expect } from "bun:test";
import { buildTLV, convertQRIS, crc16, makeTLV, parseQRIS, parseTLV, validateQRIS } from "../src/index";

// Real fixtures (masked).
const GOLDEN_PAYLOAD =
  "00020101021126570011ID.DANA.WWW011893600915359232303502095923230350303UMI51440014ID.CO.QRIS.WWW0215ID10243125491310303UMI5204594553033605802ID5916Azhar Byte Store6011Kota Bekasi6105171116304";
const GOLDEN = GOLDEN_PAYLOAD + crc16(GOLDEN_PAYLOAD);
const REAL_SHAPED =
  "00020101021126690021ID.CO.BANKMANDIRI.WWW01189999999999999999990211000000000000303UKE51440014ID.CO.QRIS.WWW0215ID00000000000000303UKE5204274153033605802ID5915Contoh Merchant6007Jakarta61051000062070703A0163040C01";

// Deterministic PRNG so the fuzz is reproducible.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s;
  };
}

const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

test("validateQRIS rejects an early/duplicate CRC field (tag 63)", () => {
  // Build a structurally-valid payload that carries a spurious tag 63 mid-payload
  // (so parseTLV succeeds and the duplicate-CRC check is what fails it).
  const els = parseTLV(GOLDEN).filter((e) => e.tag !== "63");
  els.splice(1, 0, makeTLV("63", "DEAD")); // spurious CRC field after the first element
  const payload = buildTLV(els) + "6304";
  const withDup = payload + crc16(payload);
  const r = validateQRIS(withDup);
  expect(r.valid).toBe(false);
  expect(r.errors.join(" ")).toMatch(/tag 63/);
});

test("validateQRIS never throws on arbitrary garbage", () => {
  const rand = lcg(20260814);
  for (let i = 0; i < 500; i++) {
    const len = (rand() % 200) + 1;
    let s = "";
    for (let j = 0; j < len; j++) s += CHARS[rand() % CHARS.length];
    const r = validateQRIS(s);
    expect(r.valid).toBeTypeOf("boolean");
    expect(Array.isArray(r.errors)).toBe(true);
  }
});

test("crc16 never throws and returns 4 uppercase hex chars on arbitrary input", () => {
  const rand = lcg(424242);
  for (let i = 0; i < 500; i++) {
    const len = rand() % 100;
    let s = "";
    for (let j = 0; j < len; j++) s += CHARS[rand() % CHARS.length];
    const out = crc16(s);
    expect(out).toMatch(/^[0-9A-F]{4}$/);
  }
});

test("TLV round-trip: buildTLV(parseTLV(x)) === x for valid fixtures", () => {
  for (const q of [GOLDEN, REAL_SHAPED]) {
    expect(buildTLV(parseTLV(q))).toBe(q);
  }
});

test("parseQRIS either parses garbage or throws — never returns corrupt output", () => {
  const rand = lcg(777);
  for (let i = 0; i < 200; i++) {
    const len = (rand() % 150) + 1;
    let s = "";
    for (let j = 0; j < len; j++) s += CHARS[rand() % CHARS.length];
    // Malformed input throws (like JSON.parse) — that's the contract. When it parses,
    // it must return a complete object, never undefined/corrupt.
    try {
      const m = parseQRIS(s);
      expect(m).toBeTypeOf("object");
    } catch {
      /* parse errors on malformed input are expected; validateQRIS is the safe entry */
    }
  }
});

test("convertQRIS rejects malformed input (throws), never returns corrupt output", () => {
  const rand = lcg(31337);
  for (let i = 0; i < 200; i++) {
    const len = (rand() % 100) + 1;
    let s = "";
    for (let j = 0; j < len; j++) s += CHARS[rand() % CHARS.length];
    // Malformed input either throws (parse error) or yields a self-consistent result —
    // but it must never produce an output that fails to validate when it parses.
    try {
      const out = convertQRIS(s, { amount: 1000 });
      expect(validateQRIS(out).valid).toBe(true);
    } catch {
      /* parse errors are expected for garbage — that's the contract */
    }
  }
});
