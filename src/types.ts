/** Public types for qriskit. */

/** A single TLV (Tag-Length-Value) element from a QRIS payload. */
export interface TLV {
  tag: string;
  length: number;
  value: string;
  /** Nested TLV children for structural tags (26–51, 62). */
  children?: TLV[];
}

/** QRIS initiation method. `11` = static, `12` = dynamic. */
export type QrisMethod = "static" | "dynamic";

/** Human-readable metadata parsed from a QRIS payload. */
export interface QrisMeta {
  method: QrisMethod;
  /** ISO 4217 numeric currency code, e.g. `"360"` for IDR. */
  currency: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode: string;
  /** Present only on dynamic QRIS (tag 54). */
  amount?: string;
}

/** Result of {@link validateQRIS}. */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Fee type for dynamic conversion. */
export interface ConvertOptions {
  /** Transaction amount in the currency's smallest whole unit (e.g. rupiah). */
  amount: number;
  /** Optional service fee / tip. */
  fee?: {
    type: "fixed" | "percentage";
    value: number;
  };
}
