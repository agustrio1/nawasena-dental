import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Hash scrypt dengan salt acak. Format tersimpan: "<salt-hex>:<key-hex>".
// Tidak menambah dependency (memakai node:crypto bawaan, kompatibel Bun).
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null
): Promise<boolean> {
  if (!stored) return false;
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  // timingSafeEqual melempar bila panjang beda; jaga lebih dulu.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
