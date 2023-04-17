import { WebDriver } from "selenium-webdriver";
import { setupGame } from "./game.js";
import { setupDiscord } from "./discord.js";

export async function start(driver: WebDriver) {
  await setupDiscord(driver);
  await driver.switchTo().newWindow("tab");
  await setupGame(driver);
  return driver;
}
