"use client";

import { FormEvent, useState } from "react";
import { Hash, Plus } from "lucide-react";
import { MAX_ROOM_ID_LENGTH, normalizeRoomId } from "@/lib/constants";

interface Props {
  onSubmit: (roomId: string) => void;
}

export default function RoomModal({ onSubmit }: Props) {
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const submitRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const roomId = normalizeRoomId(room);

    if (!roomId) {
      setError("Enter a room name or code");
      return;
    }

    onSubmit(roomId);
  };

  const createQuickRoom = () => {
    const randomRoom = `room-${crypto.randomUUID().slice(0, 8)}`;
    onSubmit(randomRoom);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-[1.25rem] border border-white/80 bg-white/92 p-6 shadow-soft backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Hash size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Choose a Room</h1>
            <p className="text-sm text-slate-500">Use the same room code with your friends.</p>
          </div>
        </div>

        <form onSubmit={submitRoom}>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="room">
            Room code
          </label>
          <input
            id="room"
            type="text"
            maxLength={MAX_ROOM_ID_LENGTH}
            autoComplete="off"
            placeholder="friends"
            value={room}
            onChange={(event) => {
              setError("");
              setRoom(event.target.value);
            }}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />

          {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800"
          >
            <Hash size={18} aria-hidden="true" />
            Join Room
          </button>
        </form>

        <button
          type="button"
          onClick={createQuickRoom}
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Plus size={18} aria-hidden="true" />
          Create New Room
        </button>
      </div>
    </main>
  );
}
