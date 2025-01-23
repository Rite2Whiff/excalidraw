import axios from "axios";

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
      ctx.strokeStyle = "rgb(255,255,255)";
      ctx?.strokeRect(startX, startY, width, height);
    }
  });

  canvas?.addEventListener("mouseup", function (event) {
    clicked = false;
    const width = event.clientX - startX;
    const height = event.clientY - startY;
    const shape: Shape = {
      type: "rect",
      x: startX,
      y: startY,
      width,
      height,
    };
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
