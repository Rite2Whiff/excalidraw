import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import IconButton from "./IconButton";
import { Circle, Pencil, RectangleVerticalIcon } from "lucide-react";

type Shape = "circle" | "rect" | "pencil";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState<Shape>("circle");

  useEffect(() => {
    // @ts-ignore
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId, socket);
    }
  }, [canvasRef, roomId, socket]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        height={window.innerHeight}
        width={window.innerWidth}
      ></canvas>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Shape;
  setSelectedTool: (s: Shape) => void;
}) {
  return (
    <div
      style={{ display: "flex", gap: 10, position: "fixed", left: 10, top: 10 }}
    >
      <IconButton
        activated={selectedTool === "pencil"}
        icon={<Pencil />}
        onClick={() => {
          setSelectedTool("pencil");
        }}
      />
      <IconButton
        activated={selectedTool === "rect"}
        icon={<RectangleVerticalIcon />}
        onClick={() => {
          setSelectedTool("rect");
        }}
      />
      <IconButton
        activated={selectedTool === "circle"}
        icon={<Circle />}
        onClick={() => {
          setSelectedTool("circle");
        }}
      />
    </div>
  );
}
