"use client";

import { useRouter } from "next/navigation";

export default function ProfileDropdown() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/profile")}
      className="w-10 h-10 rounded-full p-[1.5px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
      style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
    >
      <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-primary/80 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
      </div>
    </button>
  );
}
