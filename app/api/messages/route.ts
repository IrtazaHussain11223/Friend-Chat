import { NextResponse } from "next/server";
import {
  getChatChannel,
  MAX_MESSAGE_LENGTH,
  MESSAGE_HISTORY_LIMIT,
  normalizeRoomId,
  NEW_MESSAGE_EVENT
} from "@/lib/constants";
import { hasAccessSession } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { getSupabaseServer, isSupabaseConfigured, mapMessageRow } from "@/lib/supabase";
import type { Message, SendMessagePayload } from "@/lib/types";

export async function GET(req: Request) {
  if (!(await hasAccessSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roomId = normalizeRoomId(searchParams.get("roomId") || "");

  if (!roomId) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("messages")
      .select("id, room_id, username, text, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(MESSAGE_HISTORY_LIMIT);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
    }

    const messages = (data || []).reverse().map(mapMessageRow);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await hasAccessSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as SendMessagePayload;
    const roomId = normalizeRoomId(body.roomId || "");
    const username = body.username?.trim();
    const text = body.text?.trim();

    if (!roomId || !username || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    let message: Message;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from("messages")
        .insert({ room_id: roomId, username, text })
        .select("id, room_id, username, text, created_at")
        .single();

      if (error || !data) {
        console.error(error);
        return NextResponse.json({ error: "Could not save message" }, { status: 500 });
      }

      message = mapMessageRow(data);
    } else {
      message = {
        id: crypto.randomUUID(),
        roomId,
        username,
        text,
        timestamp: new Date().toISOString()
      };
    }

    await pusherServer.trigger(getChatChannel(roomId), NEW_MESSAGE_EVENT, message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
