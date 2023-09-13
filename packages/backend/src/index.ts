import { exit } from "process";
import { exportSave, sendGameCommand } from "./browser/game.js";
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
import { shareScreen, stopShareScreen } from "./browser/discord.js";
import { handleChannelUpdate } from "./discord/channelHandler.js";
import { match } from "ts-pattern";
import { LoginResponse, StatusResponse } from "@discord-plays-pokemon/common";
import { getConfig } from "./config/index.js";

let driver: WebDriver | undefined = undefined;

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
          if (driver !== undefined) {
            try {
              void sendGameCommand(driver, { command: event.request.value, quantity: 1 });
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
          event.socket.emit("login", response);
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

  driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();

  logger.info("fullscreening");
  await driver.manage().window().fullscreen();

  try {
    await start(driver);
  } catch (error) {
    logger.error(error);
    try {
      const screenshot = await driver.takeScreenshot();
      await writeFile("error.png", screenshot, "base64");
    } catch (e) {
      logger.error("unable to take screenshot while handling another error");
    }
    exit(1);
  }

  if (getConfig().bot.commands.enabled) {
    handleSlashCommands(driver);
  }
}

if (getConfig().game.enabled && getConfig().game.commands.enabled) {
  logger.info("game and discord commands are enabled");
  handleMessages(async (commandInput: CommandInput): Promise<void> => {
    if (driver !== undefined) {
      try {
        await sendGameCommand(driver, commandInput);
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
    if (driver) {
      try {
        await exportSave(driver);
        logger.info("save exported successfully");
      } catch (e) {
        logger.error(e);
      }
    }
  }, getConfig().game.saves.auto_export.interval_in_milliseconds);
}

if (getConfig().stream.dynamic_streaming) {
  let isSharing = true;
  handleChannelUpdate(async (participants) => {
    if (driver) {
      if (participants > 0 && !isSharing) {
        // TODO send channel message?
        logger.info("sharing screen since there are now participants");
        await shareScreen(driver);
        isSharing = true;
      } else if (isSharing) {
        // TODO send channel message?
        logger.info("sharing screen since there are no longer participants");
        await stopShareScreen(driver);
        isSharing = false;
      }
    } else {
      logger.error("driver is not defined");
    }
  });
}
