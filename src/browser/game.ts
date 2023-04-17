import { By, WebDriver, until } from "selenium-webdriver";
import { KeyInput } from "../command/keybinds.js";
import { wrap } from "module";

const gameWrapper = "game_wrapper";

export async function setupGame(driver: WebDriver) {
  console.log("navigating to emulator page");
  await driver.get("http://server");
  console.log("waiting for play now button");
  const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
  console.log("clicking play now button");
  await playNowButton.click();
  console.log("clicked button");
  console.log("moving mouse");
  const wrapper = await driver.findElement(By.id(gameWrapper));
  const actions = driver.actions({ async: true });
  await actions.move({ origin: wrapper }).perform();
  console.log("mouse moved");
  const fullscreenButton = await driver.wait(until.elementLocated(By.css('button[data-btn="fullscreen"]')));
  await actions.move({ origin: fullscreenButton }).perform();
  await fullscreenButton.click();
  // TODO: close ad
}

export async function sendGameKey(driver: WebDriver, key: KeyInput) {
  const wrapper = await driver.findElement(By.id(gameWrapper));
  await wrapper.sendKeys(...(key as (string | number | Promise<string | number>)[]));
}
