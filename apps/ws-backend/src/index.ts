import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function (socket) {
  socket.send("hello world");
  console.log("successfully connected the ws server");
});
