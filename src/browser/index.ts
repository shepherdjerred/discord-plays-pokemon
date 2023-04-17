import { WebDriver } from "selenium-webdriver";
import { setupGame } from "./game.js";
import { setupDiscord } from "./discord.js";

export async function start(driver: WebDriver) {
  // ADD OPTIONS
  // window size, don't prompt for mic or screen sharing
  await setupDiscord(driver);
  await driver.switchTo().newWindow("tab");
  await setupGame(driver);
  return driver;
}
