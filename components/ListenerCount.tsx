"use client";

import { useEffect, useState } from "react";

// Placeholder: a gentle random walk so the UI feels alive in dev. There's no
// real listener-count source wired up — swap this for a fetch/websocket to
// your actual backend (or delete the count if you don't have one).
function nextCount(current: number) {
  const delta = Math.floor(Math.random() * 5) - 2;
  return Math.max(120, current + delta);
}

export default function ListenerCount() {
  const [count, setCount] = useState(500);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => nextCount(c)), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs text-white/70">
      <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_6px_var(--color-amber)]" />
      {count.toLocaleString("en-IN")} listening
    </div>
  );
}
