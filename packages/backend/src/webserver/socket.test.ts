import { createServer } from "http";
import { createSocket } from "./socket.js";
import { io as Client } from "socket.io-client";

describe("socket", () => {
  it("should", (done) => {
    const server = createServer();
    createSocket({
      server,
      isCorsEnabled: false,
    });

    server.listen(() => {
      const address = server.address()?.toString();
      if (!address) {
        done();
        return;
      }
      const clientSocket = Client(address);
      clientSocket.on("connect", () => {
        done();
      });
    });
  });
});
