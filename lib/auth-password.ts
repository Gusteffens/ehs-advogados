import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "scrypt";
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const saltHex = randomBytes(SALT_BYTES).toString("hex");
  const hashHex = scryptSync(password, saltHex, KEY_LENGTH).toString("hex");
  return `${SCRYPT_PREFIX}:${saltHex}:${hashHex}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== SCRYPT_PREFIX) {
    return false;
  }

  const [, saltHex, hashHex] = parts;
  if (!saltHex || !hashHex || hashHex.length % 2 !== 0) {
    return false;
  }

  try {
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length === 0) {
      return false;
    }

    const derived = scryptSync(password, saltHex, expected.length);
    if (derived.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function constantTimeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
