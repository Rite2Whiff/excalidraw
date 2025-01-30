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
    }
  | {
      type: "";
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
  private selectedTool: Tool;
  private isDrawing: boolean;
  private draggedElement: Shape | null;
  private isDragging: boolean;
  private offSetX: number;
  private offSetY: number;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.isDrawing = true;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.offSetX = 0;
    this.offSetY = 0;
    this.selectedTool = "circle";
    this.draggedElement = null;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    this.checkIsDrawing();
  }

  checkIsDrawing() {
    if (this.selectedTool == " ") {
      this.isDrawing = false;
    } else {
      this.isDrawing = true;
    }
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
    let selectedElement: Shape | null = null;
    this.clicked = true;
    if (this.isDrawing) {
      this.startX = event.clientX;
      this.startY = event.clientY;
    } else {
      const clientRect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - clientRect.left;
      const mouseY = event.clientY - clientRect.top;
      this.existingShapes.find((shape) => {
        if (shape.type === "rect") {
          const { x, y, width, height } = shape;
          if (
            mouseX >= x &&
            mouseX <= x + width &&
            mouseY >= y &&
            mouseY <= y + height
          ) {
            selectedElement = shape;
            this.offSetX = mouseX - selectedElement.x;
            this.offSetY = mouseY - selectedElement.y;
            return selectedElement;
          } else {
            return;
          }
        } else if (shape.type === "circle") {
        }
        return selectedElement;
      });
      if (selectedElement && selectedElement !== null) {
        this.draggedElement = selectedElement;
        this.isDragging = true;
      }
      return;
    }
  };

  mouseMoveHandler = (event) => {
    if (this.clicked && this.isDrawing) {
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
      } else if (selected === "pencil") {
        this.ctx.beginPath();
        const endx = event.clientX;
        const endy = event.clientY;
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(endx, endy);
        this.ctx.stroke();
      } else {
        return;
      }
    } else if (this.clicked && this.isDragging) {
      const clientRect = this.canvas.getBoundingClientRect();
      if (this.draggedElement?.type === "rect") {
        this.draggedElement.x = event.clientX - clientRect.left - this.offSetX;
        this.draggedElement.y = event.clientY - clientRect.top - this.offSetY;
        this.clearCanvas();
      }
    }
  };

  mouseUpHandler = (event) => {
    this.clicked = false;
    this.isDragging = false;
    this.draggedElement = null;
    const width = event.clientX - this.startX;
    const height = event.clientY - this.startY;
    let shape: Shape | null = null;
    const selectedTool = this.selectedTool;
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
    } else if (selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX: event.clientX,
        endY: event.clientY,
      };
    } else {
      return;
    }

    if (!shape) {
      return;
    } else if (this.isDrawing) {
      this.existingShapes.push(shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify(shape),
          roomId: this.roomId,
        })
      );
    } else if (!this.isDrawing) {
      const foundElement = this.existingShapes.find((shape) => {
        if (shape.type === "rect" && this.draggedElement?.type === "rect") {
          return (
            shape.width === this.draggedElement.width &&
            shape.height === this.draggedElement.height
          );
        }
      });
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify(foundElement),
          roomId: this.roomId,
        })
      );
    }
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
      } else if (shape.type === "pencil") {
        this.ctx.strokeStyle = "rgb(255,255,255)";
        const startX = shape.startX;
        const startY = shape.startY;
        const endx = shape.endX;
        const endy = shape.endY;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endx, endy);
        this.ctx.stroke();
      } else {
        return;
      }
    });
  }
}
