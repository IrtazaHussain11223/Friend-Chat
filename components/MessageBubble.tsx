"use client";

import clsx from "clsx";
import type { Message } from "@/lib/types";

interface Props {
  message: Message;
  own: boolean;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function MessageBubble({ message, own }: Props) {
  return (
    <div className={clsx("flex", own ? "justify-end" : "justify-start")}>
      <article
        className={clsx(
          "max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[68%]",
          own
            ? "rounded-br-md bg-teal-600 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
        )}
      >
        <div
          className={clsx(
            "mb-1 text-xs font-semibold",
            own ? "text-teal-50" : "text-sky-700"
          )}
        >
          {message.username}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
        <time
          className={clsx(
            "mt-1 block text-right text-[0.68rem]",
            own ? "text-teal-50/80" : "text-slate-400"
          )}
        >
          {formatTimestamp(message.timestamp)}
        </time>
      </article>
    </div>
  );
}
