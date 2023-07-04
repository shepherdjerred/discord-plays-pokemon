import "twin.macro";
import { useQuery } from "@tanstack/react-query";
import { Notifications } from "./stories/Notifications";
import { Notification } from "./model/Notification";
import lodash from "lodash";
import { useEffect, useRef, useState } from "react";
import { Container } from "./stories/Container";
import { P, match } from "ts-pattern";
import { GamePage } from "./pages/GamePage";
import { LoginPage } from "./pages/LoginPage";
import { useLocalStorage } from "react-use";
import { randomId, wait } from "./util";
import { io } from "socket.io-client";

export function App() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [token, _] = useLocalStorage<string>("token");
  const identity = useQuery({
    queryKey: ["auth", token],
    queryFn: async () => {
      await wait(1000);
      const username = "Jerred";
      // addNotification({ level: "Success", id: randomId(), title: "Welcome Back", message: `Logged in as ${username}` });
      return {
        username,
      };
    },
  });

  const socket = useRef(io());
  useEffect(() => {
    socket.current.on("connect", () => {
      addNotification({ id: randomId(), level: "Info", title: "Connected", message: "Connection established" });
    });

    socket.current.on("disconnect", () => {
      addNotification({ id: randomId(), level: "Error", title: "Disconnected", message: "Connection lost" });
    });
  }, []);

  function handleKeyPress(key: string) {
    console.log(key);
    socket.current.emit("key press", key);
  }

  function addNotification(notification: Notification) {
    setNotifications([...notifications, notification]);
  }

  function handleNotificationClose(id: string) {
    setNotifications(lodash.filter(notifications, (notification) => notification.id !== id));
  }

  const page = match(identity)
    .with({ status: "success", data: { username: P.string } }, () => {
      return <GamePage onKey={handleKeyPress} />;
    })
    .with({ status: "loading" }, () => {
      return <LoginPage />;
    })
    .with({ status: "error" }, () => {
      return <LoginPage />;
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
