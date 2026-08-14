import { crc16 } from "./crc16";
import { buildTLV, makeTLV, parseTLV } from "./tlv";
import type { ConvertOptions, TLV } from "./types";

// EMV QR tag constants.
const CRC_TAG = "63";
const INITIATION_TAG = "01"; // point of initiation method (11=static, 12=dynamic)
const AMOUNT_TAG = "54";
const TIP_TAG = "55"; // tip/convenience indicator (01=prompt, 02=fixed, 03=percent)
const TIP_FIXED_TAG = "56";
const TIP_PCT_TAG = "57";
const COUNTRY_TAG = "58";

/**
 * Convert a static QRIS to dynamic:
 * 1. Flip Point of Initiation Method (`01` `11` → `12`).
 * 2. Drop any existing amount/fee tags and the old CRC.
 * 3. Insert Transaction Amount (tag 54) + optional fee (55/56 or 55/57) before Country Code (58).
 * 4. Recompute the trailing CRC16.
 *
 * @throws if `amount` is not a positive finite number, or if the input is malformed.
 */
export function convertQRIS(input: string, options: ConvertOptions): string {
  if (!Number.isFinite(options.amount) || options.amount <= 0) {
    throw new Error("amount must be a positive finite number");
  }
  if (options.fee && options.fee.value < 0) {
    throw new Error("fee value must be non-negative");
  }

  const elements = parseTLV(input.trim());
  const managed = new Set([AMOUNT_TAG, TIP_TAG, TIP_FIXED_TAG, TIP_PCT_TAG, CRC_TAG]);
  const result: TLV[] = [];
  let inserted = false;

  for (const el of elements) {
    if (managed.has(el.tag)) continue;

    if (el.tag === INITIATION_TAG) {
      result.push(makeTLV(INITIATION_TAG, "12")); // static → dynamic
      continue;
    }

    if (el.tag === COUNTRY_TAG && !inserted) {
      result.push(makeTLV(AMOUNT_TAG, Math.trunc(options.amount).toString()));
      if (options.fee) {
        if (options.fee.type === "fixed") {
          result.push(makeTLV(TIP_TAG, "02"));
          result.push(makeTLV(TIP_FIXED_TAG, Math.trunc(options.fee.value).toString()));
        } else {
          result.push(makeTLV(TIP_TAG, "03"));
          result.push(makeTLV(TIP_PCT_TAG, options.fee.value.toString()));
        }
      }
      inserted = true;
    }
    result.push(el);
  }

  if (!inserted) {
    // No country tag found — append amount at the tail (before CRC).
    result.push(makeTLV(AMOUNT_TAG, Math.trunc(options.amount).toString()));
  }

  const payload = buildTLV(result) + `${CRC_TAG}04`;
  return payload + crc16(payload);
}
