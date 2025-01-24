import axios from "axios";
import { Eclipse } from "lucide-react";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  const existingShapes: Shape[] = await getExistingShapes(roomId);

  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const parseData = JSON.parse(event.data);
    if (parseData.type === "chat") {
      const parsedShape = JSON.parse(parseData.message);
      existingShapes.push(parsedShape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);
  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas?.addEventListener("mousedown", function (event) {
    clicked = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  canvas.addEventListener("mousemove", function (event) {
    if (clicked) {
      const width = event.clientX - startX;
      const height = event.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255,255,255)";
      // @ts-ignore
      const selected = window.selectedTool;
      if (selected === "rect") {
        ctx?.strokeRect(startX, startY, width, height);
      } else if (selected === "circle") {
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        const radius = Math.max(width, height) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.beginPath();
        const endx = event.clientX;
        const endy = event.clientY;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endx, endy);
        ctx.stroke();
      }
    }
  });

  canvas?.addEventListener("mouseup", function (event) {
    clicked = false;
    const width = event.clientX - startX;
    const height = event.clientY - startY;
    let shape: Shape | null = null;
    // @ts-ignore
    const selectedTool = window.selectedTool;
    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: startX + radius,
        centerY: startY + radius,
      };
    } else {
      shape = {
        type: "pencil",
        startX,
        startY,
        endX: event.clientX,
        endY: event.clientY,
      };
    }

    if (!shape) {
      return;
    }

    existingShapes.push(shape);
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(shape),
        roomId,
      })
    );
  });

  function clearCanvas(
    existingShapes: Shape[],
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
      if (shape.type === "rect") {
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.strokeStyle = "rgb(255,255,255)";
        const centerX = shape.centerX;
        const centerY = shape.centerY;
        const radius = shape.radius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.strokeStyle = "rgb(255,255,255)";
        const startX = shape.startX;
        const startY = shape.startY;
        const endx = shape.endX;
        const endy = shape.endY;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endx, endy);
        ctx.stroke();
      }
    });
  }

  async function getExistingShapes(roomId: string) {
    const response = await axios.get(`http://localhost:3001/chats/${roomId}`, {
      headers: { Authorization: localStorage.getItem("token") },
    });
    const messages = response.data.messages;

    const shapes = messages.map((message: { message: string }) => {
      const messageData = JSON.parse(message.message);
      return messageData;
    });
    return shapes;
  }
}
