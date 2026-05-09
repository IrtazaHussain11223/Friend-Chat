"use client";

import { FormEvent, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

interface Props {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
}

export default function MessageInput({ disabled, onSend }: Props) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();

    if (!text || isSending) {
      return;
    }

    setIsSending(true);
    await onSend(text);
    setInput("");
    setIsSending(false);
  };

  return (
    <form onSubmit={sendMessage} className="flex items-end gap-2">
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type a message..."
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        disabled={disabled || isSending}
        className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button
        type="submit"
        aria-label="Send message"
        title="Send message"
        disabled={disabled || isSending || !input.trim()}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <SendHorizonal size={20} aria-hidden="true" />
      </button>
    </form>
  );
}
