import { WebDriver } from "selenium-webdriver";
import { focusContentFrame, importSave, setupGame } from "./game.js";
import { setupDiscord } from "./discord.js";
import { getConfig } from "../config/index.js";

export async function start(driver: WebDriver) {
  if (getConfig().stream.enabled) {
    await setupDiscord(driver);
  }
  if (getConfig().stream.enabled && getConfig().game.enabled) {
    await driver.switchTo().newWindow("tab");
  }
  if (getConfig().game.enabled) {
    await setupGame(driver);
    if (getConfig().game.saves.auto_import.enabled) {
      await importSave(driver);
    }
    // await fullscreenGame(driver);
    await focusContentFrame(driver);
  }
}
