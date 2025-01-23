"use client";

import { useEffect, useRef } from "react";
import { initDraw } from "../draw";

export default function Canvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId);
    }
  }, [canvasRef, roomId]);

  return <canvas height={1000} width={2000}></canvas>;
}
