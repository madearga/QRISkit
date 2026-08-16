import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { convertQRIS, parseQRIS, validateQRIS, type QrisMeta } from "../lib/qriskit";

export const Route = createFileRoute("/")({
  component: Demo,
});

/** Sample QRIS strings (masked — safe for a public demo). */
const SAMPLES: Record<string, string> = {
  DANA: `00020101021126570011ID.DANA.WWW011893600915359232303502095923230350303UMI51440014ID.CO.QRIS.WWW0215ID10243125491310303UMI5204594553033605802ID5916Azhar Byte Store6011Kota Bekasi61051711163040FB0`,
  Mandiri: `00020101021126690021ID.CO.BANKMANDIRI.WWW01189999999999999999990211000000000000303UKE51440014ID.CO.QRIS.WWW0215ID00000000000000303UKE5204274153033605802ID5915Contoh Merchant6007Jakarta61051000062070703A0163040C01`,
  ShopeePay: `00020101021240550016ID.CO.SHOPEE.WWW011800000000000000000002090000000005204482953033605802ID5915Contoh Merchant6015Jakarta Selatan61051000062470804DMCT993500000000000000000000000000000000000630491F3`,
};

const FEE_TYPES: { value: "fixed" | "percentage"; label: string }[] = [
  { value: "fixed", label: "Rp" },
  { value: "percentage", label: "%" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

function Demo() {
  const [qris, setQris] = useState("");
  const [amount, setAmount] = useState("25000");
  const [feeType, setFeeType] = useState<"fixed" | "percentage">("percentage");
  const [feeValue, setFeeValue] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [convertOutput, setConvertOutput] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live parse + validate, recomputed on every keystroke.
  const { validation, meta, parseError } = useMemo(() => {
    if (!qris.trim()) return { validation: null, meta: null, parseError: null };
    try {
      return {
        validation: validateQRIS(qris),
        meta: parseQRIS(qris) as QrisMeta,
        parseError: null,
      };
    } catch (e) {
      return { validation: null, meta: null, parseError: (e as Error).message };
    }
  }, [qris]);

  const loadSample = useCallback((name: string) => {
    setQris(SAMPLES[name]);
    setError(null);
    setConvertOutput(null);
    setQrDataUrl(null);
  }, []);

  const onUpload = useCallback(
    (file: File | null) => {
      if (!file) return;
      setError(null);
      setConvertOutput(null);
      setQrDataUrl(null);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const scale = 4;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("canvas not supported");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(new Uint8ClampedArray(data), width, height);
            if (decoded?.data) {
              setQris(decoded.data);
            } else {
              setError("No QR code found in image. Make sure it's in focus.");
            }
          } catch (e) {
            setError("Failed to decode image: " + (e as Error).message);
          }
        };
        img.onerror = () => setError("Could not load the selected image.");
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const onConvert = useCallback(() => {
    if (!qris.trim()) return;
    setError(null);
    setConvertOutput(null);
    setQrDataUrl(null);
    try {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt < 0) throw new Error("Amount must be a non-negative number.");
      const fee =
        feeValue.trim() === "" || Number(feeValue) === 0
          ? undefined
          : { type: feeType, value: Number(feeValue) };
      const out = convertQRIS(qris, { amount: amt, fee });
      setConvertOutput(out);
      QRCode.toDataURL(out, { margin: 2, width: 256, errorCorrectionLevel: "M" })
        .then(setQrDataUrl)
        .catch(() => setError("Failed to render QR image."));
    } catch (e) {
      setError("Convert failed: " + (e as Error).message);
    }
  }, [qris, amount, feeType, feeValue]);

  const methodLabel = meta?.method === "dynamic" ? "Dinamis" : "Statis";

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">qriskit demo</h1>
        <p className="text-sm text-zinc-400">
          Parse, validate &amp; convert QRIS strings — all client-side. Powered by{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">qriskit</code>.
        </p>
      </header>

      <Section title="Input QRIS">
        <div className="mb-3 flex flex-wrap gap-2">
          {Object.keys(SAMPLES).map((name) => (
            <button
              key={name}
              onClick={() => loadSample(name)}
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Contoh {name}
            </button>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
          >
            Upload QR
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
        </div>
        <textarea
          value={qris}
          onChange={(e) => setQris(e.target.value)}
          placeholder="Paste a QRIS string here, or load a sample / upload a QR image…"
          rows={5}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-500"
        />
      </Section>

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
          ⚠ {error}
        </div>
      )}

      <Section title="Validasi">
        {!qris.trim() ? (
          <p className="text-sm text-zinc-500">Masukkan QRIS string untuk memvalidasi.</p>
        ) : parseError ? (
          <p className="text-sm text-red-400">Parse error: {parseError}</p>
        ) : validation ? (
          validation.valid ? (
            <p className="text-sm font-medium text-green-400">valid ✓</p>
          ) : (
            <div className="text-sm text-red-400">
              <p className="font-medium">invalid ✗</p>
              {validation.errors.length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {validation.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        ) : null}
      </Section>

      <Section title="Metadata">
        {meta ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <dt className="text-zinc-500">Metode</dt>
              <dd>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    meta.method === "dynamic"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-sky-500/20 text-sky-300"
                  }`}
                >
                  {methodLabel}
                </span>
              </dd>
            </div>
            {meta.provider && (
              <div className="flex items-center gap-2">
                <dt className="text-zinc-500">Provider</dt>
                <dd>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                    {meta.provider}
                  </span>
                </dd>
              </div>
            )}
            {meta.merchantName && (
              <div>
                <dt className="text-zinc-500">Merchant</dt>
                <dd className="font-medium">{meta.merchantName}</dd>
              </div>
            )}
            {meta.merchantCity && (
              <div>
                <dt className="text-zinc-500">Kota</dt>
                <dd>{meta.merchantCity}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">Mata uang</dt>
              <dd>{meta.currency || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Amount</dt>
              <dd>{meta.amount ? new Intl.NumberFormat("id-ID").format(Number(meta.amount)) : "—"}</dd>
            </div>
            {meta.issuerGui && (
              <div>
                <dt className="text-zinc-500">Issuer GUI</dt>
                <dd className="break-all font-mono text-xs">{meta.issuerGui}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-zinc-500">Tidak ada metadata untuk ditampilkan.</p>
        )}
      </Section>

      <Section title="Konversi ke Dinamis">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-400">Amount (Rp)</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-36 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-zinc-500"
            />
          </label>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-400">Fee</span>
            <div className="flex overflow-hidden rounded-lg border border-zinc-700">
              {FEE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFeeType(t.value)}
                  className={`px-2 py-1.5 text-sm ${
                    feeType === t.value ? "bg-zinc-700 text-zinc-100" : "bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <input
                type="number"
                min="0"
                value={feeValue}
                onChange={(e) => setFeeValue(e.target.value)}
                className="w-20 border-l border-zinc-700 bg-zinc-950 px-3 py-1.5 text-zinc-100 outline-none focus:border-zinc-500"
              />
            </div>
          </div>
          <button
            onClick={onConvert}
            disabled={!qris.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            Convert
          </button>
        </div>

        {convertOutput && (
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row">
            <div className="rounded-lg bg-white p-3">
              {qrDataUrl && <img src={qrDataUrl} alt="Dynamic QRIS QR code" className="h-40 w-40" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Dynamic QRIS string
              </p>
              <textarea
                readOnly
                value={convertOutput}
                rows={5}
                className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>
        )}
      </Section>

      <footer className="mt-8 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
        <p>
          Built by{" "}
          <a
            href="https://argakuka.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
          >
            Argakuka
          </a>
          {" "}— Sample QRIS strings are masked and for demo purposes only.
        </p>
      </footer>
    </div>
  );
}
