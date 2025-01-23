"use client";

import { useEffect, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRiNWU5Ny04OTc4LTQyMjctODY5Ny0yMjI5ZGM4ZDFhYjkiLCJpYXQiOjE3Mzc2MDg2ODN9.XTgLSkFMPjjw1770215EMmqbyOP2jVDSFr6HH20xrBQ"
    );
    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    };
  }, [roomId]);

  if (!socket) {
    return <div>connecting to the ws server ...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
