import { exit } from "process";
import { sendGameCommand } from "./browser/game.js";
import { start } from "./browser/index.js";
import { handleMessages } from "./discord/messageHandler.js";
import { Browser, Builder } from "selenium-webdriver";
import { writeFile } from "fs/promises";
import { Options } from "selenium-webdriver/firefox.js";
import { handleCommands, sendStartupMessage } from "./discord/commands/index.js";
import { CommandInput } from "./command/commandInput.js";

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

try {
  await start(driver);
} catch (error) {
  console.error(error);
  const screenshot = await driver.takeScreenshot();
  await writeFile("error.png", screenshot, "base64");
  exit(1);
}

console.log("fullscreening");
await driver.manage().window().fullscreen();

handleMessages(async (commandInput: CommandInput): Promise<void> => {
  await sendGameCommand(driver, commandInput);
});

handleCommands(driver);

await sendStartupMessage();
// await stopIfInactive();
// await loopExportSave(driver);
