"use client";

import { useEffect, useState } from "react";
import AccessGate from "@/components/AccessGate";
import ChatWindow from "@/components/ChatWindow";
import RoomModal from "@/components/RoomModal";
import UsernameModal from "@/components/UsernameModal";

type AuthState = "checking" | "locked" | "needs-name" | "needs-room" | "ready";

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    fetch("/api/access", { method: "DELETE" })
      .then(() => setAuthState("locked"))
      .catch(() => setAuthState("locked"));
  }, []);

  const handleAccessGranted = () => {
    setAuthState("needs-name");
  };

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    setAuthState("needs-room");
  };

  const handleRoomSubmit = (nextRoomId: string) => {
    setRoomId(nextRoomId);
    setAuthState("ready");
  };

  const handleLogout = async () => {
    await fetch("/api/access", { method: "DELETE" }).catch(() => undefined);
    setUsername("");
    setRoomId("");
    setAuthState("locked");
  };

  if (authState === "checking") {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="h-11 w-11 rounded-full border-4 border-slate-200 border-t-teal-500 animate-spin" />
      </main>
    );
  }

  if (authState === "locked") {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  if (authState === "needs-name") {
    return <UsernameModal onSubmit={handleUsernameSubmit} />;
  }

  if (authState === "needs-room") {
    return <RoomModal onSubmit={handleRoomSubmit} />;
  }

  return (
    <ChatWindow
      username={username}
      roomId={roomId}
      onChangeName={() => setAuthState("needs-name")}
      onChangeRoom={() => setAuthState("needs-room")}
      onLogout={handleLogout}
    />
  );
}
