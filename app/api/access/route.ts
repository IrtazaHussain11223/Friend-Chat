import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/constants";
import { createAccessToken, getAccessCode, hasAccessSession } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ authorized: await hasAccessSession() });
}

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const accessCode = getAccessCode();

  if (!accessCode) {
    return NextResponse.json(
      { error: "CHAT_ACCESS_CODE is not configured" },
      { status: 500 }
    );
  }

  if (code !== accessCode) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const response = NextResponse.json({ authorized: true });
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: createAccessToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authorized: false });
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
