"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "submit"];

export default function AdminUnlock({ title }: { title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function trySubmit(value: string) {
    if (!value || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });
      if (!res.ok) {
        setShake(true);
        setPin("");
        setTimeout(() => setShake(false), 900);
        return;
      }
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  function enterKey(key: string) {
    if (loading) return;
    setShake(false);
    if (key === "submit") {
      trySubmit(pin);
      return;
    }
    if (key === "clear") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    setPin((p) => (p + key).slice(0, PIN_LENGTH));
  }

  useEffect(() => {
    if (pin.length >= PIN_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      trySubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setPin("");
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      enterKey(e.key);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      enterKey("clear");
    } else if (e.key === "Enter") {
      trySubmit(pin);
    } else if (e.key === "Escape") {
      setOpen(false);
      setPin("");
    }
  }

  return (
    <div ref={containerRef} className="relative mb-3.5 flex h-[34px] items-center">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[21px] font-extrabold tracking-[-0.01em] text-ink"
        >
          {title}
        </button>
      ) : (
        <div className="relative h-full" onKeyDown={onKeyDown} tabIndex={-1}>
          <input
            autoFocus
            type="password"
            inputMode="none"
            readOnly
            pattern="[0-9]*"
            autoComplete="off"
            aria-label="관리자 번호"
            value={pin}
            className={`h-full w-[184px] rounded-lg bg-paper text-center text-base font-bold tracking-[0.2em] text-ink outline-none transition-colors duration-300 ${
              shake ? "animate-admin-pin-shake bg-red-500/15 text-red-500" : ""
            }`}
          />
        </div>
      )}

      {open && (
        <div
          className="absolute left-0 top-[42px] z-30 w-[min(220px,calc(100vw-2rem))] rounded-xl bg-paper p-2 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-3 gap-1">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => enterKey(key)}
                aria-label={
                  key === "clear" ? "관리자 번호 지우기" : key === "submit" ? "관리자 로그인" : undefined
                }
                className="flex h-11 items-center justify-center rounded-lg text-[22px] font-semibold text-[#777] transition-colors hover:text-ink active:bg-accent-soft active:text-ink"
              >
                {key === "clear" ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9.2 5H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9.2a2 2 0 0 1-1.5-.7L2.8 13.3a2 2 0 0 1 0-2.6l4.9-5A2 2 0 0 1 9.2 5Z" />
                    <path d="m11.5 9 6 6m0-6-6 6" />
                  </svg>
                ) : key === "submit" ? (
                  "→"
                ) : (
                  key
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
