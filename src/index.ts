import { exit } from "process";
import { sendGameCommand } from "./browser/game.js";
import { handleMessages } from "./discord/messageHandler.js";
import { Browser, Builder, WebDriver } from "selenium-webdriver";
import { writeFile } from "fs/promises";
import { Options } from "selenium-webdriver/firefox.js";
import { handleCommands } from "./discord/commands/index.js";
import { CommandInput } from "./command/commandInput.js";
import { listen } from "./server/index.js";
import { config } from "./config/index.js";
import { start } from "./browser/index.js";

let driver: WebDriver | undefined = undefined;
if (config.stream.enabled || config.game.enabled) {
  console.log("browser is enabled");
  driver = await new Builder()
    .forBrowser(Browser.FIREFOX)
    .setFirefoxOptions(
      new Options()
        .setPreference("media.navigator.permission.disabled", true)
        .setPreference("media.autoplay.block-webaudio", false)
        .setPreference("privacy.webrtc.legacyGlobalIndicator", false)
        .setPreference("privacy.webrtc.hideGlobalIndicator", true)
    )
    .build();

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

if (config.web.api.enabled) {
  console.log("api is enabled");
  listen(config.web.port, async (commandInput: CommandInput): Promise<void> => {
    if (driver !== undefined) {
      await sendGameCommand(driver, commandInput);
    }
  });
}

if (config.game.enabled && config.game.commands.enabled) {
  console.log("game and discord commands are enabled");
  handleMessages(async (commandInput: CommandInput): Promise<void> => {
    if (driver !== undefined) {
      await sendGameCommand(driver, commandInput);
    }
  });
}
