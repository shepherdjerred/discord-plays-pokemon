import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "../config/index.js";

export function listen(port: number) {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("key press", (event) => {
      console.log(event);
    });
  });

  app.use(express.static(config.web.assets));

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
