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
  /** Friendly payment provider name (e.g. "ShopeePay"), or the raw GUI when unknown. */
  provider?: string;
  /** Raw Globally Unique Identifier from the merchant-account-info tag. */
  issuerGui?: string;
  /** Parsed merchant account info (tag 26/40/51). */
  merchantAccountInfo?: MerchantAccountInfo;
  /** Parsed additional data field (tag 62). */
  additionalData?: AdditionalData;
}

/** Parsed merchant account info from tag 26 (retail) / 40 / 51 (cross-border). */
export interface MerchantAccountInfo {
  /** Tag the info was found in. */
  tag: string;
  /** Globally Unique Identifier (sub-tag 00), e.g. "ID.CO.SHOPEE.WWW". */
  gui: string;
  /** Merchant PAN / ID (sub-tag 01), when present. */
  pan?: string;
  /** Merchant criteria (sub-tag 03), when present. */
  criteria?: string;
  /** All sub-fields as tag → value. */
  fields: Record<string, string>;
}

/** Parsed additional data (tag 62) sub-fields. Read-only. */
export interface AdditionalData {
  billNumber?: string; // 01
  mobileNumber?: string; // 02
  storeLabel?: string; // 03
  loyaltyNumber?: string; // 04
  referenceLabel?: string; // 05
  customerLabel?: string; // 06
  terminalLabel?: string; // 07
  purpose?: string; // 08
  additionalConsumerDataRequest?: string; // 09
  merchantTaxId?: string; // 10
  merchantChannel?: string; // 11
  /** Payment-system-specific fields (sub-tags 50–99), tag → value. */
  paymentSystemSpecific?: Record<string, string>;
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
