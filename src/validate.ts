import { crc16 } from "./crc16";
import { parseTLV } from "./tlv";
import type { ValidationResult } from "./types";

/**
 * Validate a QRIS payload's structure and CRC16 integrity.
 *
 * The CRC field is tag `63` with a 4-hex value, computed by the issuer over the
 * preceding payload (including the `6304` prefix). This recomputes it and compares.
 */
export function validateQRIS(input: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = input.trim();
  if (trimmed.length < 10) {
    return { valid: false, errors: ["too short to be a QRIS payload"] };
  }

  const crcMatch = trimmed.match(/6304([0-9A-Fa-f]{4})$/);
  if (!crcMatch) {
    errors.push("missing or malformed CRC field (expected ...6304<4 hex>)");
  }

  try {
    const elements = parseTLV(trimmed);
    if (elements[0]?.tag !== "00") {
      errors.push("does not start with payload format indicator (tag 00)");
    }
  } catch (e) {
    errors.push(`parse error: ${(e as Error).message}`);
  }

  if (crcMatch) {
    const stored = crcMatch[1].toUpperCase();
    const payload = trimmed.slice(0, -4); // drop the 4-hex value, keep the "6304" prefix
    const computed = crc16(payload);
    if (stored !== computed) {
      errors.push(`CRC mismatch: stored ${stored}, computed ${computed}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
