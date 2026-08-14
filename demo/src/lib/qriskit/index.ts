/**
 * qriskit — zero-dependency, runtime-agnostic TypeScript toolkit for QRIS.
 *
 * Parse, validate, and convert static→dynamic QRIS payloads. Works in Bun, Node,
 * browsers, Deno, and edge runtimes (Cloudflare Workers). Not affiliated with Bank Indonesia.
 */

export { crc16 } from "./crc16";
export { parseTLV, buildTLV, makeTLV } from "./tlv";
export { convertQRIS } from "./convert";
export { validateQRIS } from "./validate";
export { parseQRIS } from "./meta";
export { providerFromGui, findMerchantInfo } from "./provider";
export type {
  TLV,
  QrisMethod,
  QrisMeta,
  ValidationResult,
  ConvertOptions,
  MerchantAccountInfo,
  AdditionalData,
} from "./types";
