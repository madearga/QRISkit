import type { TLV } from "./types";

/** Merchant-account-info tags, in detection priority order (specific retail issuer first). */
const MERCHANT_INFO_TAGS = ["26", "40", "51"];

/**
 * Known Indonesian issuer Globally Unique Identifiers (sub-tag 00) → friendly provider name.
 * Case-insensitive. Not authoritative (not verified against the Bank Indonesia registry) —
 * extend as needed. Unknown GUIs fall back to the raw string.
 */
const GUI_TO_PROVIDER: Record<string, string> = {
  "id.co.shopee.www": "ShopeePay",
  "com.go-jek.www": "GoPay",
  "id.go-jek.www": "GoPay",
  "id.dana.www": "DANA",
  "id.ovo.www": "OVO",
  "id.co.bankmandiri.www": "Bank Mandiri",
  "id.co.bca.www": "BCA",
  "id.co.bri.www": "BRI",
  "id.co.bni.www": "BNI",
  "id.co.qris.www": "QRIS",
  "id.linkaja.www": "LinkAja",
  "id.co.xendit.www": "Xendit",
};

/** Friendly provider name for a GUI, or the raw GUI when unknown. */
export function providerFromGui(gui: string): string {
  return GUI_TO_PROVIDER[gui.toLowerCase()] ?? gui;
}

/** Find the first merchant-account-info tag with parsed children (priority 26 → 40 → 51). */
export function findMerchantInfo(
  elements: TLV[],
): { tag: string; children: TLV[] } | undefined {
  for (const tag of MERCHANT_INFO_TAGS) {
    const el = elements.find((e) => e.tag === tag);
    if (el?.children?.length) return { tag, children: el.children };
  }
  return undefined;
}

/** Reduce a list of TLV children to a tag→value record. */
export function childrenToRecord(children: TLV[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const c of children) r[c.tag] = c.value;
  return r;
}
