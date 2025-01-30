import { useEffect, useRef, useState } from "react";
import IconButton from "./IconButton";
import { Circle, Pencil, RectangleVerticalIcon } from "lucide-react";
import { Game } from "../draw/Game";

export type Tool = "circle" | "rect" | "pencil" | " ";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool | " ">(" ");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      g.setTool(selectedTool);
      setGame(g);

      return () => {
        g.destroyMouseHandlers();
      };
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
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
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
