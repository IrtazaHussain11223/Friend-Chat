"use client";

import { FormEvent, useState } from "react";
import { UserRoundCheck } from "lucide-react";
import { MAX_USERNAME_LENGTH } from "@/lib/constants";

interface Props {
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ onSubmit }: Props) {
  const [name, setName] = useState("");

  const submitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim() || "Guest";
    onSubmit(cleanName.slice(0, MAX_USERNAME_LENGTH));
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={submitName}
        className="w-full max-w-sm rounded-[1.25rem] border border-white/80 bg-white/92 p-6 shadow-soft backdrop-blur"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
            <UserRoundCheck size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Choose a Name</h1>
            <p className="text-sm text-slate-500">This is how friends will see you.</p>
          </div>
        </div>

        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">
          Nickname
        </label>
        <input
          id="username"
          type="text"
          maxLength={MAX_USERNAME_LENGTH}
          autoComplete="nickname"
          placeholder="Ayesha"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
        />

        <button
          type="submit"
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800"
        >
          Start Chatting
        </button>
      </form>
    </main>
  );
}
