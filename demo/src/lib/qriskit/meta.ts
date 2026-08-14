import { parseTLV } from "./tlv";
import { childrenToRecord, findMerchantInfo, providerFromGui } from "./provider";
import type { AdditionalData, QrisMeta, TLV } from "./types";

const ADDITIONAL_DATA_NAMES: Record<string, keyof AdditionalData> = {
  "01": "billNumber",
  "02": "mobileNumber",
  "03": "storeLabel",
  "04": "loyaltyNumber",
  "05": "referenceLabel",
  "06": "customerLabel",
  "07": "terminalLabel",
  "08": "purpose",
  "09": "additionalConsumerDataRequest",
  "10": "merchantTaxId",
  "11": "merchantChannel",
};

function parseAdditionalData(children: TLV[]): AdditionalData {
  const ad: AdditionalData = {};
  const paymentSystemSpecific: Record<string, string> = {};
  for (const c of children) {
    const name = ADDITIONAL_DATA_NAMES[c.tag];
    if (name) {
      (ad as Record<string, string | undefined>)[name as string] = c.value;
    } else {
      const n = Number.parseInt(c.tag, 10);
      if (n >= 50 && n <= 99) paymentSystemSpecific[c.tag] = c.value;
    }
  }
  if (Object.keys(paymentSystemSpecific).length) ad.paymentSystemSpecific = paymentSystemSpecific;
  return ad;
}

/** Parse human-readable metadata from a QRIS payload, including provider + additional data. */
export function parseQRIS(input: string): QrisMeta {
  const elements = parseTLV(input.trim());
  const get = (tag: string): string | undefined => elements.find((e) => e.tag === tag)?.value;
  const methodValue = get("01");

  const meta: QrisMeta = {
    method: methodValue === "12" ? "dynamic" : "static",
    currency: get("53") ?? "",
    countryCode: get("58") ?? "",
    merchantName: get("59") ?? "",
    merchantCity: get("60") ?? "",
    postalCode: get("61") ?? "",
    amount: get("54"),
  };

  // Provider + merchant account info (tag 26 / 40 / 51).
  const mi = findMerchantInfo(elements);
  if (mi) {
    const fields = childrenToRecord(mi.children);
    const gui = fields["00"] ?? "";
    meta.issuerGui = gui || undefined;
    meta.provider = gui ? providerFromGui(gui) : undefined;
    meta.merchantAccountInfo = {
      tag: mi.tag,
      gui,
      pan: fields["01"],
      criteria: fields["03"],
      fields,
    };
  }

  // Additional data (tag 62) — read-only.
  const t62 = elements.find((e) => e.tag === "62");
  if (t62?.children?.length) {
    meta.additionalData = parseAdditionalData(t62.children);
  }

  return meta;
}
