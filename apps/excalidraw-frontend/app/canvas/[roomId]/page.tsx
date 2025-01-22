"use client";
import { useEffect, useRef } from "react";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = document.getElementById("canvas");

      const ctx = canvasRef.current.getContext("2d");

      canvas?.addEventListener("mousedown", function (event) {
        console.log(event.clientX);
        console.log(event.clientY);

        canvas?.addEventListener("mousemove", function (event) {
          console.log(event.clientX);
          console.log(event.clientY);
        });
      });

      canvas?.addEventListener("mouseup", function (event) {
        console.log(event.clientX);
        console.log(event.clientY);
      });
    } else {
      return;
    }
  }, [canvasRef]);

  return (
    <div>
      <canvas id="canvas" className="w-full h-full" ref={canvasRef}></canvas>
    </div>
  );
}
