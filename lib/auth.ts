import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "i80_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function sessionSecret(): string {
  const password = process.env.ADMIN_PASSWORD || "";
  return `${password}::${process.env.ADMIN_SECRET || "i80things-session"}`;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const expires = Date.now() + MAX_AGE * 1000;
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(String(expires))
    .digest("hex");
  return `${expires}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!process.env.ADMIN_PASSWORD) return false;
  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(expires)
    .digest("hex");
  if (!safeEqual(signature, expected)) return false;
  return Number(expires) > Date.now();
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

export const sessionCookie = {
  name: COOKIE,
  maxAge: MAX_AGE,
};
