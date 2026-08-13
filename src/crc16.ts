/**
 * CRC-16/CCITT-FALSE — the QRIS / EMVCo QR code CRC.
 *
 * Polynomial: 0x1021 · Initial value: 0xFFFF · No input/output reflection · No final XOR.
 *
 * Canonical check value: `crc16("123456789") === "29B1"`.
 * Byte-identical to the reference implementation in `verssache/qris-dinamis`.
 */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
