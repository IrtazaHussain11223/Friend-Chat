"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

interface Props {
  onAccessGranted: () => void;
}

export default function AccessGate({ onAccessGranted }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Invalid access code");
      return;
    }

    onAccessGranted();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={checkCode}
        className="w-full max-w-sm rounded-[1.25rem] border border-white/80 bg-white/92 p-6 shadow-soft backdrop-blur"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-100 text-teal-700">
            <LockKeyhole size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Private Chat</h1>
            <p className="text-sm text-slate-500">Enter the shared code to continue.</p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="access-code">
          Access code
        </label>
        <input
          id="access-code"
          type="password"
          autoComplete="current-password"
          placeholder="FriendChat2026"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
        />

        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !code.trim()}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ShieldCheck size={18} aria-hidden="true" />
          {isSubmitting ? "Checking..." : "Enter Chat"}
        </button>
      </form>
    </main>
  );
}
