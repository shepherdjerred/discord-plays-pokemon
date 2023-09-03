import { Server } from "socket.io";
import { logger } from "../logger.js";
import http from "http";
import { fromEvent } from "rxjs";
import { Socket } from "dgram";
import lodash from "lodash";

export function createSocket({ server, isCorsEnabled }: { server: http.Server; isCorsEnabled: boolean }) {
  logger.info("starting web socket listener");

  let cors;

  if (isCorsEnabled) {
    logger.info("enabling cors for the web socket");
    cors = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }

  const io = new Server(server, {
    cors,
  });

  const connection = fromEvent(io, "connection");

  connection.subscribe((socket) => {
    logger.info("a new socket has connected");
    const events = ["disconnect", "status", "key press", "screenshot", "ping", "login"];
    return lodash.map(events, (event) => fromEvent(socket as Socket, event));
  });

  return connection;
}
