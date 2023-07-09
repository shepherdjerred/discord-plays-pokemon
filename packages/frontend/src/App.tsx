import "twin.macro";
import { Notifications } from "./stories/Notifications";
import { Notification } from "./model/Notification";
import lodash from "lodash";
import { useEffect, useState } from "react";
import { Container } from "./stories/Container";
import { P, match } from "ts-pattern";
import { GamePage } from "./pages/GamePage";
import { LoginPage } from "./pages/LoginPage";
import { useInterval } from "react-use";
import { randomId } from "./util";
import { Connection } from "./model/Connection";
import { socket } from "./socket";
import { Player, Status } from "@discord-plays-pokemon/common";

export function App() {
  const [player, setPlayer] = useState<Player>();
  const [status, setStatus] = useState<Status>({
    playerList: [],
  });
  const [connection, setConnection] = useState<Connection>({
    status: "connecting",
    latency: undefined,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      addNotification({ id: randomId(), level: "Info", title: "Connected", message: "Connection established" });
      setConnection({
        ...connection,
        status: "connected",
      });
    });

    socket.on("disconnect", () => {
      addNotification({ id: randomId(), level: "Error", title: "Disconnected", message: "Connection lost" });
      setConnection({
        ...connection,
        status: "disconnected",
      });
    });

    socket.on("status", (payload) => {
      const status = StatusSchema.parse(payload);
      setStatus(status);
    });

    socket.on("status", (payload) => {
      const status = StatusSchema.parse(payload);
      setStatus(status);
    });

    socket.on("login", (payload) => {
      const loginResponse = LoginResponseSchema.parse(payload);
      console.log(loginResponse);
      setPlayer(loginResponse.player);
    });
  }, []);

  useInterval(() => {
    const start = Date.now();

    socket.emit("ping", () => {
      const duration = Date.now() - start;
      setConnection({
        ...connection,
        latency: duration,
      });
    });
  }, 2000);

  function handleLogin(token: string) {
    console.log("logging in with:", token);

    const loginRequest: LoginRequest = { token };
    socket.emit("login", loginRequest);
  }

  function handleKeyPress(key: string) {
    console.log(key);
    socket.emit("key press", key);
  }

  function addNotification(notification: Notification) {
    setNotifications([...notifications, notification]);
  }

  function handleNotificationClose(id: string) {
    setNotifications(lodash.filter(notifications, (notification) => notification.id !== id));
  }

  function handleScreenshot() {
    console.log("screenshot");
    socket.emit("screenshot");
  }

  const page = match(player)
    .with(P.not(P.nullish), (player) => {
      return (
        <GamePage
          status={status}
          connection={connection}
          onKey={handleKeyPress}
          onScreenshot={handleScreenshot}
          player={player}
        />
      );
    })
    .with(P.nullish, () => {
      return <LoginPage handleLogin={handleLogin} />;
    })
    .exhaustive();

  return (
    <>
      <div tw="bg-white dark:bg-slate-900 min-h-screen min-w-full">
        <Container>
          <div tw="flex flex-col justify-center h-full gap-y-5">{page}</div>
        </Container>
      </div>
      <Notifications notifications={notifications} onClose={handleNotificationClose} />
    </>
  );
}
