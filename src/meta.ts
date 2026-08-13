import { parseTLV } from "./tlv";
import type { QrisMeta } from "./types";

/** Parse human-readable metadata from a QRIS payload. */
export function parseQRIS(input: string): QrisMeta {
  const elements = parseTLV(input.trim());
  const get = (tag: string): string | undefined => elements.find((e) => e.tag === tag)?.value;
  const methodValue = get("01");
  return {
    method: methodValue === "12" ? "dynamic" : "static",
    currency: get("53") ?? "",
    countryCode: get("58") ?? "",
    merchantName: get("59") ?? "",
    merchantCity: get("60") ?? "",
    postalCode: get("61") ?? "",
    amount: get("54"),
  };
}
