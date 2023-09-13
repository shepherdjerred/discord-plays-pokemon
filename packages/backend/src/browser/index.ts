import { WebDriver } from "selenium-webdriver";
import { focusContentFrame, importSave, setupGame } from "./game.js";
import { setupDiscord } from "./discord.js";
import { getConfig } from "../config/index.js";

export async function start(gameDriver: WebDriver, streamDriver: WebDriver) {
  if (getConfig().stream.enabled) {
    await setupDiscord(streamDriver);
  }
  if (getConfig().game.enabled) {
    await setupGame(gameDriver);
    if (getConfig().game.saves.auto_import.enabled) {
      await importSave(gameDriver);
    }
    // await fullscreenGame(driver);
    await focusContentFrame(gameDriver);
  }
}
