"use client";
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function ChatRoomClient({
  id,
  messages,
}: {
  messages: { message: string }[];
  id: string;
}) {
  const [chats, setChats] = useState(messages);
  const { loading, socket } = useSocket();
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    console.log("hello world");
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: id,
        })
      );
      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setChats((message) => [...message, { message: parsedData.message }]);
        }
      };
    }
  }, [socket, loading, id]);

  return (
    <div>
      {chats.map((chat, index) => (
        <div key={index}>{chat.message}</div>
      ))}
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      />
      <button
        onClick={() => {
          socket?.send(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage,
            })
          );
          console.log(
            JSON.stringify({
              type: "chat",
              roomId: id,
              message: currentMessage,
            })
          );

          console.log("hello world");
        }}
      >
        Send Message
      </button>
    </div>
  );
}
