import crypto from "node:crypto";

function getSecret(): string {
  const s = process.env["SESSION_SECRET"];
  if (!s) throw new Error("SESSION_SECRET is not configured");
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromB64url(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export interface TokenPayload {
  sub: string;
  type: "session" | "reset";
  exp: number;
  role?: string;
  uid?: string;
}

export function signToken(payload: TokenPayload): string {
  const json = JSON.stringify(payload);
  const body = b64url(Buffer.from(json, "utf8"));
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest();
  return `${body}.${b64url(sig)}`;
}

export function verifyToken(
  token: string,
  type: TokenPayload["type"],
): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, sig] = parts as [string, string];
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(body)
      .digest();
    const got = fromB64url(sig);
    if (
      expected.length !== got.length ||
      !crypto.timingSafeEqual(expected, got)
    ) {
      return null;
    }
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as TokenPayload;
    if (payload.type !== type) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
