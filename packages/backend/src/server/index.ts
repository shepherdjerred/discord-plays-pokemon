import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "../config/index.js";
import { CommandInput } from "../command/commandInput.js";
import cors from "cors";
import { LoginRequestSchema, LoginResponse, Player, Status } from "@discord-plays-pokemon/common";
import { z } from "zod";

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

  const players: Player[] = [];

  io.on("connection", (socket) => {
    let player: Player | undefined;

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("status", () => {
      const status: Status = {
        playerList: players,
      };

      socket.emit("status", status);
    });

    socket.on("key press", async (payload) => {
      if (!player) {
        return;
      }

      const key = z.string().parse(payload);
      await fn({
        command: key,
        quantity: 1,
      });
    });

    socket.on("screenshot", () => {
      if (!player) {
        return;
      }

      // TODO
    });

    socket.on("ping", (callback: () => void) => {
      callback();
    });

    socket.on("login", (payload) => {
      LoginRequestSchema.parse(payload);
      // perform auth here
      player = { discordId: "id", discordUsername: "username" };
      const response: LoginResponse = {
        player,
      };
      socket.emit("login", response);
    });
  });

  app.use(cors());
  app.use(express.static(config.web.assets));

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
