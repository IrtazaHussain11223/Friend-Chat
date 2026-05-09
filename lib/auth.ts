import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/constants";

const SESSION_VALUE = "granted";

function secret() {
  return (
    process.env.CHAT_SESSION_SECRET ||
    process.env.CHAT_ACCESS_CODE ||
    process.env.NEXT_PUBLIC_CHAT_ACCESS_CODE ||
    "friend-chat-dev-secret"
  );
}

export function getAccessCode() {
  return process.env.CHAT_ACCESS_CODE || process.env.NEXT_PUBLIC_CHAT_ACCESS_CODE;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createAccessToken() {
  return `${SESSION_VALUE}.${sign(SESSION_VALUE)}`;
}

export function isValidAccessToken(token?: string) {
  if (!token) {
    return false;
  }

  const [value, signature] = token.split(".");

  if (value !== SESSION_VALUE || !signature) {
    return false;
  }

  const expected = sign(value);

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function hasAccessSession() {
  const cookieStore = await cookies();
  return isValidAccessToken(cookieStore.get(ACCESS_COOKIE)?.value);
}
