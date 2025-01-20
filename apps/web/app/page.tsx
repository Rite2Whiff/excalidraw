"use client";

import { useRouter } from "next/navigation";

export default function Home() {
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
      <button onClick={() => router.push("/auth/signup")}>Signup</button>
      <button onClick={() => router.push("/auth/login")}>Login</button>
    </div>
  );
}
