import { convertQRIS, parseQRIS, validateQRIS } from "./index";
import type { ConvertOptions } from "./index";

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

const USAGE = `qris — QRIS toolkit (qriskit)

Usage:
  qris convert <qris> <amount> [--fee=fixed:<n>|percent:<n>]   static → dynamic
  qris validate <qris>                                         check structure + CRC
  qris info <qris>                                             full metadata (JSON)
  qris provider <qris>                                         provider name only`;

function parseFee(args: string[]): ConvertOptions["fee"] | undefined {
  const raw = args.find((a) => a.startsWith("--fee="));
  if (!raw) return undefined;
  const [type, num] = raw.slice("--fee=".length).split(":");
  if ((type !== "fixed" && type !== "percent") || num === undefined) return undefined;
  const value = Number(num);
  if (!Number.isFinite(value)) return undefined;
  return { type: type === "fixed" ? "fixed" : "percentage", value };
}

/** Pure CLI entry: parse argv, return { code, stdout, stderr }. No console/exit side effects. */
export function runCli(argv: string[]): CliResult {
  const [cmd, ...rest] = argv;
  try {
    switch (cmd) {
      case "convert": {
        const [qris, amountStr] = rest;
        if (!qris || !amountStr) return { code: 2, stdout: "", stderr: USAGE };
        const amount = Number(amountStr);
        if (!Number.isFinite(amount) || amount <= 0) {
          return { code: 1, stdout: "", stderr: "error: amount must be a positive number" };
        }
        return { code: 0, stdout: convertQRIS(qris, { amount, fee: parseFee(rest) }) + "\n", stderr: "" };
      }
      case "validate": {
        const [qris] = rest;
        if (!qris) return { code: 2, stdout: "", stderr: USAGE };
        const r = validateQRIS(qris);
        return r.valid
          ? { code: 0, stdout: "valid\n", stderr: "" }
          : { code: 1, stdout: "", stderr: `invalid:\n  - ${r.errors.join("\n  - ")}\n` };
      }
      case "info": {
        const [qris] = rest;
        if (!qris) return { code: 2, stdout: "", stderr: USAGE };
        return { code: 0, stdout: JSON.stringify(parseQRIS(qris), null, 2) + "\n", stderr: "" };
      }
      case "provider": {
        const [qris] = rest;
        if (!qris) return { code: 2, stdout: "", stderr: USAGE };
        return { code: 0, stdout: (parseQRIS(qris).provider ?? "unknown") + "\n", stderr: "" };
      }
      default:
        return { code: 2, stdout: "", stderr: USAGE };
    }
  } catch (e) {
    return { code: 1, stdout: "", stderr: `error: ${(e as Error).message}\n` };
  }
}
