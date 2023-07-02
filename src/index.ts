import { exit } from "process";
import { sendGameCommand } from "./browser/game.js";
import { start } from "./browser/index.js";
import { handleMessages } from "./discord/messageHandler.js";
import { Browser, Builder } from "selenium-webdriver";
import { writeFile } from "fs/promises";
import { Options } from "selenium-webdriver/firefox.js";
import { handleCommands } from "./discord/commands/index.js";
import { CommandInput } from "./command/commandInput.js";
import { listen } from "./server/index.js";
import { config } from "./config/index.js";

if (config.web.api.enabled) {
  listen(config.web.port);
}

if (config.stream.enabled || config.game.enabled) {
  const driver = await new Builder()
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

  if (config.game.enabled && config.game.commands.enabled) {
    handleMessages(async (commandInput: CommandInput): Promise<void> => {
      await sendGameCommand(driver, commandInput);
    });
  }

  if (config.bot.commands.enabled) {
    handleCommands(driver);
  }
}
