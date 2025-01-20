"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormEvent } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await axios.post("http://localhost:3001/signup", {
      name,
      email,
      password,
    });

    alert(response.data.message);
    router.push("/auth/login");
  }

  return (
    <form
      onSubmit={handleSignup}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="name"
        style={{ padding: 10 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        Sign up
      </button>
    </form>
  );
}
