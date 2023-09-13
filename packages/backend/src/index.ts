import { exportSave, sendGameCommand } from "./game/browser/game.js";
import { handleMessages } from "./game/discord/messageHandler.js";
import { WebDriver } from "selenium-webdriver";
import { handleSlashCommands } from "./game/discord/slashCommands/index.js";
import { CommandInput } from "./game/command/commandInput.js";
import { createWebServer } from "./webserver/index.js";
import { registerSlashCommands } from "./game/discord/slashCommands/rest.js";
import { logger } from "./logger.js";
import { handleChannelUpdate } from "./game/discord/channelHandler.js";
import { match } from "ts-pattern";
import { LoginResponse, StatusResponse } from "@discord-plays-pokemon/common";
import { getConfig } from "./config/index.js";
import { streamMachine } from "./stream/machine.js";
import { interpret } from "xstate";

const stream = interpret(streamMachine);

if (getConfig().stream.enabled) {
  logger.info("initializing stream");
  stream.start();
}

let gameDriver: WebDriver | undefined;

if (getConfig().bot.commands.update) {
  await registerSlashCommands();
}

if (getConfig().web.enabled) {
  const { socket } = createWebServer({
    port: getConfig().web.port,
    webAssetsPath: getConfig().web.assets,
    isApiEnabled: getConfig().web.api.enabled,
    isCorsEnabled: getConfig().web.cors,
  });

  if (socket) {
    socket.subscribe((event) => {
      match(event)
        .with({ request: { kind: "command" } }, (event) => {
          logger.info("handling command request", event.request);
          if (gameDriver !== undefined) {
            try {
              void sendGameCommand(gameDriver, { command: event.request.value, quantity: 1 });
            } catch (e) {
              logger.error(e);
            }
          }
        })
        .with({ request: { kind: "login" } }, (event) => {
          logger.info("handling login request", event.request);
          // TODO: perform auth here
          const player = { discordId: "id", discordUsername: "username" };
          const response: LoginResponse = {
            kind: "login",
            value: player,
          };
          event.socket.emit("response", response);
        })
        .with({ request: { kind: "screenshot" } }, (event) => {
          logger.info("handling screenshot request", event.request);
        })
        .with({ request: { kind: "status" } }, (event) => {
          logger.info("handling status request", event.request);
          const response: StatusResponse = {
            kind: "status",
            value: {
              playerList: [],
            },
          };
          event.socket.emit("response", response);
        })
        .exhaustive();
    });
  }
}

if (getConfig().game.enabled) {
  logger.info("browser is enabled");

  if (getConfig().bot.commands.enabled) {
    handleSlashCommands(gameDriver);
  }
}

if (getConfig().game.enabled && getConfig().game.commands.enabled) {
  logger.info("game and discord commands are enabled");
  handleMessages(async (commandInput: CommandInput): Promise<void> => {
    if (gameDriver !== undefined) {
      try {
        await sendGameCommand(gameDriver, commandInput);
      } catch (e) {
        logger.error(e);
      }
    }
  });
}

if (getConfig().game.saves.auto_export.enabled) {
  logger.info("auto export saves is enabled");
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(async () => {
    logger.info("exporting save");
    if (gameDriver) {
      try {
        await exportSave(gameDriver);
        logger.info("save exported successfully");
      } catch (e) {
        logger.error(e);
      }
    }
  }, getConfig().game.saves.auto_export.interval_in_milliseconds);
}

if (getConfig().stream.dynamic_streaming) {
  logger.info("dynamic streaming is enabled");
  handleChannelUpdate(async (participants) => {
    logger.info("handling channel update.");
    logger.info(participants);
    if (stream) {
      if (participants > 0) {
        logger.info("sharing screen since there are now participants");
        stream.send({ type: "start_stream" });
      } else {
        logger.info("stop sharing screen since there are no longer participants");
        try {
          logger.info("saving game before disconnecting");
          if (gameDriver) {
            await exportSave(gameDriver);
          }
          stream.send({ type: "end_stream" });
        } catch (e) {
          logger.error(e);
        }
      }
    }
  });
}
