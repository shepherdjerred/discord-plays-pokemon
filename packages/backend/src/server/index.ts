import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "../config/index.js";
import { CommandInput } from "../command/commandInput.js";
import cors from "cors";
import { LoginRequestSchema, LoginResponse, Player, Status } from "@discord-plays-pokemon/common";
import { z } from "zod";
import { resolve } from "path";
import { existsSync } from "fs";
import { exit } from "process";
import { addErrorLinks } from "../util.js";

export function listen(port: number, fn: (commandInput: CommandInput) => Promise<void>) {
  const app = express();
  const server = http.createServer(app);

  if (config.web.api.enabled) {
    console.log("api is enabled");
    setupSocket(server, fn);
  }

  if (config.web.cors) {
    app.use(cors());
  }

  const path = resolve(config.web.assets);

  if (!existsSync(path)) {
    console.error(addErrorLinks(`The web assets do not exist at expected path, which is ${path}`));
    exit(1);
  }

  app.use(express.static(path));

  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

function setupSocket(server: http.Server, fn: (commandInput: CommandInput) => Promise<void>) {
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
}
