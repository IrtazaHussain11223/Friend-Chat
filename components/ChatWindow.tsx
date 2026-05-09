"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Settings } from "lucide-react";
import Pusher from "pusher-js";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { CHAT_CHANNEL, NEW_MESSAGE_EVENT } from "@/lib/constants";
import type { Message } from "@/lib/types";

interface Props {
  username: string;
  onChangeName: () => void;
}

export default function ChatWindow({ username, onChangeName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      setStatus("Pusher is not configured");
      setError("Add NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER to .env.local.");
      return;
    }

    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(CHAT_CHANNEL);

    pusher.connection.bind("connected", () => setStatus("Live"));
    pusher.connection.bind("unavailable", () => setStatus("Reconnecting..."));
    pusher.connection.bind("failed", () => {
      setStatus("Offline");
      setError("Realtime connection failed. Check your Pusher settings.");
    });

    channel.bind(NEW_MESSAGE_EVENT, (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHAT_CHANNEL);
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    setError("");

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, text })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Message failed to send.");
    }
  };

  return (
    <main className="mx-auto flex h-[100dvh] max-w-5xl flex-col bg-white shadow-soft sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[1.25rem] sm:border sm:border-white/80">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
            <MessageCircle size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-950">Friend Chat</h1>
            <p className="truncate text-xs font-medium text-slate-500">
              {status} as {username}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeName}
          aria-label="Change username"
          title="Change username"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <Settings size={18} aria-hidden="true" />
        </button>
      </header>

      <section className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm">
                <MessageCircle size={22} aria-hidden="true" />
              </div>
              <p className="font-semibold text-slate-800">No messages yet</p>
              <p className="mt-1 text-sm text-slate-500">Send the first one when you are ready.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                own={message.username === username}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </section>

      {error && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 sm:px-6">
          {error}
        </div>
      )}

      <footer className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <MessageInput onSend={sendMessage} disabled={status === "Pusher is not configured"} />
      </footer>
    </main>
  );
}
