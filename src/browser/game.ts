import { By, WebDriver, until } from "selenium-webdriver";
import { KeyInput } from "../command/keybinds.js";

export async function setupGame(driver: WebDriver) {
  console.log("navigating to emulator page");
  await driver.get("http://server");
  console.log("waiting for play now button");
  const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
  console.log("clicking play now button");
  await playNowButton.click();
  console.log("clicked button");
}

export async function sendGameKey(driver: WebDriver, key: KeyInput) {
  const element = await driver.findElement(By.css("body"));
  await driver.actions().click(element).keyDown(key).pause(10).keyUp(key).perform();
}
