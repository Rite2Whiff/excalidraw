"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormEvent } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await axios.post("http://localhost:3001/login", {
      email,
      password,
    });

    document.cookie = `token=${response.data.token}; Path=/; Secure; SameSite=Strict`;
    alert("you are successfully logged in");
    router.push("/join-room");
  }

  return (
    <form
      onSubmit={handleLogin}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <input
        type="email"
        placeholder="email"
        style={{ padding: 10 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="enter password"
        style={{ padding: 10 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button style={{ padding: "10px 20px", cursor: "pointer" }} type="submit">
        Sign in
      </button>
    </form>
  );
}
