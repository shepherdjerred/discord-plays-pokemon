import { sendGameCommand } from "./browser/game.js";
import { handleMessages } from "./discord/messageHandler.js";
import { Browser, Builder, WebDriver } from "selenium-webdriver";
import { writeFile } from "fs/promises";
import { Options } from "selenium-webdriver/firefox.js";
import { handleSlashCommands } from "./discord/slashCommands/index.js";
import { CommandInput } from "./game/command/commandInput.js";
import { createWebServer } from "./webserver/index.js";
import { start } from "./browser/index.js";
import lodash from "lodash";
import { registerSlashCommands } from "./discord/slashCommands/rest.js";
import { logger } from "./logger.js";
import { disconnect, joinVoiceChat, shareScreen } from "./browser/discord.js";
import { handleChannelUpdate } from "./discord/channelHandler.js";
import { match } from "ts-pattern";
import { LoginResponse, StatusResponse } from "@discord-plays-pokemon/common";
import { getConfig } from "./config/index.js";

let gameDriver: WebDriver | undefined;
let streamDriver: WebDriver | undefined;

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

if (getConfig().stream.enabled || getConfig().game.enabled) {
  logger.info("browser is enabled");

  const options = new Options();

  lodash.forOwn(getConfig().game.browser.preferences, (value, key) => {
    options.setPreference(key, value);
  });

  gameDriver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
  streamDriver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();

  try {
    await start(gameDriver, streamDriver);
  } catch (error) {
    logger.error(error);
    try {
      const screenshot = await gameDriver.takeScreenshot();
      await writeFile("error.png", screenshot, "base64");
    } catch (e) {
      logger.error("unable to take screenshot while handling another error");
      throw e;
    }
  }

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

if (getConfig().stream.dynamic_streaming) {
  logger.info("dynamic streaming is enabled");
  handleChannelUpdate(async (participants) => {
    logger.info("handling channel update.");
    logger.info(participants);
    if (streamDriver) {
      if (participants > 0) {
        logger.info("sharing screen since there are now participants");
        try {
          await joinVoiceChat(streamDriver);
          await shareScreen(streamDriver);
          await streamDriver.switchTo().window((await streamDriver.getAllWindowHandles())[1]);
        } catch (e) {
          logger.error(e);
        }
      } else {
        logger.info("stop sharing screen since there are no longer participants");
        try {
          await disconnect(streamDriver);
        } catch (e) {
          logger.error(e);
        }
      }
    } else {
      logger.error("driver is not defined");
    }
  });
}
