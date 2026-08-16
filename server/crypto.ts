import crypto from "node:crypto";

const algorithm = "aes-256-gcm";
function key() { return crypto.createHash("sha256").update(process.env.JWT_SECRET || "fallback-development-key").digest(); }

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");
  const decipher = crypto.createDecipheriv(algorithm, key(), Buffer.from(ivText, "base64url"));
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64url")), decipher.final()]).toString("utf8");
}
