"use client";

import { useEffect, useState } from "react";
import AccessGate from "@/components/AccessGate";
import ChatWindow from "@/components/ChatWindow";
import UsernameModal from "@/components/UsernameModal";

type AuthState = "checking" | "locked" | "needs-name" | "ready";

const USERNAME_KEY = "friend-chat-username";

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = window.localStorage.getItem(USERNAME_KEY) || "";
    setUsername(savedUsername);

    fetch("/api/access")
      .then((res) => res.json())
      .then((data: { authorized?: boolean }) => {
        if (!data.authorized) {
          setAuthState("locked");
          return;
        }

        setAuthState(savedUsername ? "ready" : "needs-name");
      })
      .catch(() => setAuthState("locked"));
  }, []);

  const handleAccessGranted = () => {
    setAuthState(username ? "ready" : "needs-name");
  };

  const handleUsernameSubmit = (name: string) => {
    window.localStorage.setItem(USERNAME_KEY, name);
    setUsername(name);
    setAuthState("ready");
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

  return <ChatWindow username={username} onChangeName={() => setAuthState("needs-name")} />;
}
