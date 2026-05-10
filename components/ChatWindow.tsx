/*"use client";

import { useEffect, useRef, useState } from "react";
import { Hash, LogOut, MessageCircle, Settings } from "lucide-react";
import Pusher from "pusher-js";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { getChatChannel, NEW_MESSAGE_EVENT } from "@/lib/constants";
import type { Message } from "@/lib/types";

interface Props {
  username: string;
  roomId: string;
  onChangeName: () => void;
  onChangeRoom: () => void;
  onLogout: () => void;
}

export default function ChatWindow({
  username,
  roomId,
  onChangeName,
  onChangeRoom,
  onLogout
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([]);
    setError("");

    fetch(`/api/messages?roomId=${encodeURIComponent(roomId)}`)
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || "Could not load message history.");
        }

        return response.json() as Promise<{ messages: Message[] }>;
      })
      .then((data) => setMessages(data.messages || []))
      .catch((historyError: Error) => setError(historyError.message));
  }, [roomId]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      setStatus("Pusher is not configured");
      setError("Add NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER to .env.local.");
      return;
    }

    const pusher = new Pusher(key, { cluster });
    const channelName = getChatChannel(roomId);
    const channel = pusher.subscribe(channelName);

    pusher.connection.bind("connected", () => setStatus("Live"));
    pusher.connection.bind("unavailable", () => setStatus("Reconnecting..."));
    pusher.connection.bind("failed", () => {
      setStatus("Offline");
      setError("Realtime connection failed. Check your Pusher settings.");
    });

    channel.bind(NEW_MESSAGE_EVENT, (message: Message) => {
      if (message.roomId !== roomId) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((current) => current.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    setError("");

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, username, text })
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
              {status} in #{roomId} as {username}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onChangeRoom}
            aria-label="Change room"
            title="Change room"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <Hash size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onChangeName}
            aria-label="Change username"
            title="Change username"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <Settings size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
            className="grid h-10 w-10 place-items-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
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
*/
"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Settings, LogOut } from "lucide-react";
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

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    fetch("/api/messages")
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || "Could not load message history.");
        }
        return response.json() as Promise<{ messages: Message[] }>;
      })
      .then((data) => setMessages(data.messages || []))
      .catch((err: Error) => setError(err.message));
  }, []);

  // ---------------- PUSHER ----------------
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      setStatus("Pusher is not configured");
      setError("Add PUSHER keys in .env");
      return;
    }

    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(CHAT_CHANNEL);

    pusher.connection.bind("connected", () => setStatus("Live"));
    pusher.connection.bind("unavailable", () => setStatus("Reconnecting..."));
    pusher.connection.bind("failed", () => {
      setStatus("Offline");
      setError("Realtime connection failed.");
    });

    channel.bind(NEW_MESSAGE_EVENT, (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHAT_CHANNEL);
      pusher.disconnect();
    };
  }, []);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async (text: string) => {
    setError("");

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, text }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || "Message failed to send.");
    }
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    sessionStorage.removeItem("chat_access");
    sessionStorage.removeItem("chat_username");

    window.location.reload(); // back to AccessGate
  };

  // ---------------- UI ----------------
  return (
    <main className="mx-auto flex h-[100dvh] max-w-5xl flex-col bg-white shadow-soft sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[1.25rem] sm:border sm:border-white/80">
      
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6">
        
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
            <MessageCircle size={20} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-950">
              Friend Chat
            </h1>
            <p className="truncate text-xs font-medium text-slate-500">
              {status} as {username}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">

          {/* Change username */}
          <button
            type="button"
            onClick={onChangeName}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Change username"
          >
            <Settings size={18} />
          </button>

          {/* LOGOUT BUTTON */}
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

        </div>
      </header>

      {/* CHAT AREA */}
      <section className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] px-4 py-5 sm:px-6">
        
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm">
                <MessageCircle size={22} />
              </div>
              <p className="font-semibold text-slate-800">No messages yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Send the first one 👋
              </p>
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

      {/* ERROR */}
      {error && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* INPUT */}
      <footer className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
        <MessageInput onSend={sendMessage} disabled={status !== "Live"} />
      </footer>
    </main>
  );
}
