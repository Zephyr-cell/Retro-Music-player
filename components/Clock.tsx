"use client";

import { useEffect, useState } from "react";
import { teko } from "@/lib/fonts";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function Clock() {
  // Start null so the server-rendered markup has no time in it — we fill it
  // in on mount, avoiding a hydration mismatch against the visitor's clock.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <div className={`${teko.className} text-2xl tracking-wide text-transparent`}>--:--</div>;
  }

  const parts = formatter.formatToParts(now);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value ?? "";

  return (
    <div className={`${teko.className} tabular flex items-baseline text-2xl tracking-wide text-white/90`}>
      <span>{hour}</span>
      <span className="blink">:</span>
      <span>{minute}</span>
      <span className="ml-1.5 text-sm text-white/60">{dayPeriod}</span>
    </div>
  );
}
