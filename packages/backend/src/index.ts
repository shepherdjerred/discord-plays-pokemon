import { exit } from "process";
import { exportSave, sendGameCommand } from "./browser/game.js";
import { handleMessages } from "./discord/messageHandler.js";
import { Browser, Builder, WebDriver } from "selenium-webdriver";
import { writeFile } from "fs/promises";
import { Options } from "selenium-webdriver/firefox.js";
import { handleCommands } from "./discord/commands/index.js";
import { CommandInput } from "./command/commandInput.js";
import { listen } from "./server/index.js";
import { config } from "./config/index.js";
import { start } from "./browser/index.js";
import lodash from "lodash";
import { registerCommands } from "./discord/commands/rest.js";

let driver: WebDriver | undefined = undefined;

if (config.bot.commands.update) {
  console.log("registering commands");
  await registerCommands();
}

if (config.web.enabled) {
  console.log("web is enabled");
  listen(config.web.port, async (commandInput: CommandInput): Promise<void> => {
    if (driver !== undefined) {
      try {
        await sendGameCommand(driver, commandInput);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

if (config.stream.enabled || config.game.enabled) {
  console.log("browser is enabled");

  const options = new Options();

  lodash.forOwn(config.game.browser.preferences, (value, key) => {
    options.setPreference(key, value);
  });

  driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();

  console.log("fullscreening");
  await driver.manage().window().fullscreen();

  try {
    await start(driver);
  } catch (error) {
    console.error(error);
    const screenshot = await driver.takeScreenshot();
    await writeFile("error.png", screenshot, "base64");
    exit(1);
  }

  if (config.bot.commands.enabled) {
    handleCommands(driver);
  }
}

if (config.game.enabled && config.game.commands.enabled) {
  console.log("game and discord commands are enabled");
  handleMessages(async (commandInput: CommandInput): Promise<void> => {
    if (driver !== undefined) {
      try {
        await sendGameCommand(driver, commandInput);
      } catch (e) {
        console.error(e);
      }
    }
  });
}

if (config.game.saves.auto_export.enabled) {
  console.log("auto export saves is enabled");
  setInterval(() => {
    console.log("exporting save");
    if (driver) {
      void exportSave(driver);
    }
  }, config.game.saves.auto_export.interval_in_milliseconds);
}
