import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "../config/index.js";
import { CommandInput } from "../command/commandInput.js";
import cors from "cors";

export function listen(port: number, fn: (commandInput: CommandInput) => Promise<void>) {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("key press", async (event) => {
      console.log(event);
      await fn({
        command: event as string,
        quantity: 1,
      });
    });

    socket.on("ping", (callback: () => void) => {
      callback();
    });

    socket.on("login", (event) => {
      console.log(event);
      socket.emit("login", { player: { discordId: "test", discordUsername: "me" } });
    });
  });

  app.use(cors());
  app.use(express.static(config.web.assets));

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
