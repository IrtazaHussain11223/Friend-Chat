import { NextResponse } from "next/server";
import { CHAT_CHANNEL, MAX_MESSAGE_LENGTH, NEW_MESSAGE_EVENT } from "@/lib/constants";
import { hasAccessSession } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import type { Message, SendMessagePayload } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await hasAccessSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as SendMessagePayload;
    const username = body.username?.trim();
    const text = body.text?.trim();

    if (!username || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    const message: Message = {
      id: crypto.randomUUID(),
      username,
      text,
      timestamp: new Date().toISOString()
    };

    await pusherServer.trigger(CHAT_CHANNEL, NEW_MESSAGE_EVENT, message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
