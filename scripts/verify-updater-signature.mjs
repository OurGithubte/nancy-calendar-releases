#!/usr/bin/env node
/**
 * Xác minh chữ ký updater Tauri (minisign Ed25519, prehashed BLAKE2b-512) của
 * installer Windows bằng public key CỐ ĐỊNH của app Nancy Calendar for Windows.
 * Chặn phát hành mọi installer ký bằng key khác.
 *
 *   node scripts/verify-updater-signature.mjs <file> <file.sig>
 */
import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";

// Public key (công khai, không phải bí mật) — trùng desktop/src-tauri/tauri.conf.json của app.
export const NANCY_WINDOWS_UPDATER_PUBKEY =
  "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEYxOTYyRThFMkY5RkY0MzEKUldReDlKOHZqaTZXOFI2YWJZK1g4TFAwMlBXdkJTSkgxZ2tMZWtLQWVQRHFvZzRsSzlPWGxnUk4K";

/** Giải mã chuỗi base64 kiểu Tauri (base64 của file text minisign) thành các dòng. */
function minisignLines(b64) {
  return Buffer.from(b64.trim(), "base64").toString("utf8").split(/\r?\n/);
}

/** Public key minisign (Ed25519) -> { keyId, key } */
export function parsePublicKey(pubkeyB64) {
  const raw = Buffer.from(minisignLines(pubkeyB64)[1] ?? "", "base64");
  if (raw.length !== 42 || raw.subarray(0, 2).toString() !== "Ed") throw new Error("public key không hợp lệ");
  const key = createPublicKey({
    key: { kty: "OKP", crv: "Ed25519", x: raw.subarray(10).toString("base64url") },
    format: "jwk",
  });
  return { keyId: raw.subarray(2, 10).toString("hex"), key };
}

/** Xác minh chữ ký updater của Tauri (minisign, prehashed BLAKE2b-512) — giống tauri-plugin-updater. */
export function verifyUpdaterSignature(fileBytes, sigB64, pubkeyB64) {
  const { keyId, key } = parsePublicKey(pubkeyB64);
  const lines = minisignLines(sigB64);
  const sig = Buffer.from(lines[1] ?? "", "base64");
  const trusted = (lines[2] ?? "").replace(/^trusted comment: /, "");
  const globalSig = Buffer.from(lines[3] ?? "", "base64");
  if (sig.length !== 74) throw new Error("chữ ký sai định dạng");
  const alg = sig.subarray(0, 2).toString();
  if (sig.subarray(2, 10).toString("hex") !== keyId) throw new Error("chữ ký từ key khác (key id không khớp)");
  const message = alg === "ED" ? createHash("blake2b512").update(fileBytes).digest() : fileBytes;
  if (!verify(null, message, key, sig.subarray(10))) throw new Error("chữ ký file không hợp lệ");
  if (!verify(null, Buffer.concat([sig.subarray(10), Buffer.from(trusted)]), key, globalSig)) {
    throw new Error("trusted comment bị sửa");
  }
  return { keyId, trusted };
}


const [file, sigFile] = process.argv.slice(2);
if (!file || !sigFile) {
  console.error("usage: verify-updater-signature.mjs <file> <file.sig>");
  process.exit(2);
}
try {
  const { trusted } = verifyUpdaterSignature(readFileSync(file), readFileSync(sigFile, "utf8"), NANCY_WINDOWS_UPDATER_PUBKEY);
  console.log(`signature OK: ${file} (${trusted})`);
} catch (error) {
  console.error(`signature FAIL: ${file}: ${error.message}`);
  process.exit(1);
}
