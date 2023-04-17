import { exit } from "process";
import { sendGameKey } from "./browser/game.js";
import { start } from "./browser/index.js";
import { KeyInput } from "./command/keybinds.js";
import { handleMessages } from "./discord/messageHandler.js";
import { Browser, Builder } from "selenium-webdriver";
import { writeFile } from "fs/promises";
import { Options } from "selenium-webdriver/firefox.js";
import configuration from "./configuration.js";

const driver = await new Builder()
  .forBrowser(Browser.FIREFOX)
  .setFirefoxOptions(
    new Options()
      .addArguments("--user-data-dir", configuration.userDataPath)
      .setPreference("media.navigator.permission.disabled", true)
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

handleMessages(async (key: KeyInput) => {
  return await sendGameKey(driver, key);
});
