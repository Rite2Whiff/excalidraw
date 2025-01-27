import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

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

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private clicked: boolean;
  private startX: number;
  private startY: number;
  private selectedTool: Tool = "circle";

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.startX = 0;
    this.startY = 0;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const parseData = JSON.parse(event.data);
      if (parseData.type === "chat") {
        const parsedShape = JSON.parse(parseData.message);
        this.existingShapes.push(parsedShape);
        this.clearCanvas();
      }
    };
  }

  mouseDownHandler = (event) => {
    this.clicked = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
  };

  mouseMoveHandler = (event) => {
    if (this.clicked) {
      const width = event.clientX - this.startX;
      const height = event.clientY - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255,255,255)";
      // @ts-ignore
      const selected = this.selectedTool;
      if (selected === "rect") {
        this.ctx?.strokeRect(this.startX, this.startY, width, height);
      } else if (selected === "circle") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(width, height) / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
      } else {
        this.ctx.beginPath();
        const endx = event.clientX;
        const endy = event.clientY;
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(endx, endy);
        this.ctx.stroke();
      }
    }
  };

  mouseUpHandler = (event) => {
    this.clicked = false;
    const width = event.clientX - this.startX;
    const height = event.clientY - this.startY;
    let shape: Shape | null = null;
    const selectedTool = this.selectedTool;
    console.log(selectedTool);
    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    } else {
      shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX: event.clientX,
        endY: event.clientY,
      };
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);
    console.log(shape);
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(shape),
        roomId: this.roomId,
      })
    );
  };

  initMouseHandlers() {
    this.canvas?.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
  }

  destroyMouseHandlers() {
    this.canvas?.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = "rgb(255,255,255)";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.strokeStyle = "rgb(255,255,255)";
        const centerX = shape.centerX;
        const centerY = shape.centerY;
        const radius = shape.radius;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
      } else {
        this.ctx.strokeStyle = "rgb(255,255,255)";
        const startX = shape.startX;
        const startY = shape.startY;
        const endx = shape.endX;
        const endy = shape.endY;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endx, endy);
        this.ctx.stroke();
      }
    });
  }
}
