import { WebDriver } from "selenium-webdriver";
import { focusContentFrame, importSave, setupGame } from "./game.js";
import { setupDiscord } from "./discord.js";
import { config } from "../config/index.js";

export async function start(driver: WebDriver) {
  if (config.stream.enabled) {
    await setupDiscord(driver);
  }
  if (config.stream.enabled && config.game.enabled) {
    await driver.switchTo().newWindow("tab");
  }
  if (config.game.enabled) {
    await setupGame(driver);
    if (config.game.saves.auto_import.enabled) {
      await importSave(driver);
    }
    // await fullscreenGame(driver);
    await focusContentFrame(driver);
  }
}
