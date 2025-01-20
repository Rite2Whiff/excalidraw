"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinRoom() {
  const [slug, setSlug] = useState(" ");
  const router = useRouter();
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="enter roomId"
        style={{ padding: 10 }}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button
        style={{ padding: 10 }}
        onClick={() => router.push(`/room/${slug}`)}
      >
        Join Room
      </button>
    </div>
  );
}
