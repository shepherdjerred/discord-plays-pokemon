import { WebDriver } from "selenium-webdriver";
import { focusContentFrame, setupGame } from "./game.js";
import { setupDiscord } from "./discord.js";
import { getConfig } from "../config/index.js";

export async function start(gameDriver: WebDriver, streamDriver: WebDriver) {
  if (getConfig().stream.enabled) {
    await setupDiscord(streamDriver);
  }
  if (getConfig().game.enabled) {
    await setupGame(gameDriver);
    await focusContentFrame(gameDriver);
  }
}
