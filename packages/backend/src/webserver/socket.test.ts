import { createServer } from "http";
import { createSocket } from "./socket.js";
import { io as Client } from "socket.io-client";
import { Request, RequestSchema } from "@discord-plays-pokemon/common";

describe("socket", () => {
  it("should handle login requests", (done) => {
    const port = 8081;
    const server = createServer();
    const observable = createSocket({
      server,
      isCorsEnabled: false,
    });

    server.listen(port, () => {
      const clientSocket = Client(`http://127.0.0.1:${port}`);
      clientSocket.on("connect", () => {
        const request: Request = {
          kind: "login",
          value: {
            token: "string",
          },
        };
        clientSocket.emit("request", request);
      });
    });

    observable.subscribe((observer) => {
      RequestSchema.parse(observer.request);
      server.close();
      done();
    });
  });
});
