import express from "express";
import http from "http";
import { Server } from "socket.io";

export function listen(port: number) {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  app.use(express.static("static"));

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
