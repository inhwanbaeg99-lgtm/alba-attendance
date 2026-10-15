"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import DayPanel from "@/components/DayPanel";

export default function DayPage() {
  // useParams는 런타임 값이라 프리렌더를 막지 않도록 Suspense 안에서 읽는다.
  return (
    <Suspense>
      <DayView />
    </Suspense>
  );
}

function DayView() {
  const router = useRouter();
  const params = useParams<{ date: string }>();
  const date = params.date;

  return (
    <div className="flex flex-1 justify-center p-4 pt-8">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="달력으로 돌아가기"
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink"
        >
          ‹
        </button>
        <div className="rounded-2xl bg-paper p-4">
          <DayPanel date={date} />
        </div>
      </div>
    </div>
  );
}
