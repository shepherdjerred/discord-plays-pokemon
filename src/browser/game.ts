import { By, WebDriver, until } from "selenium-webdriver";
import { CommandInput, isBurst, isHold, isHoldB } from "../command/commandInput.js";
import configuration from "../configuration.js";
import { toGameboyAdvanceKeyInput } from "../command/keybinds.js";
import { delay } from "../util.js";

export async function setupGame(driver: WebDriver) {
  console.log("navigating to emulator page");
  await driver.get("http://server");
  console.log("waiting for play now button");
  const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
  console.log("clicking play now button");
  await playNowButton.click();
  console.log("clicked button");
}

export async function sendGameCommand(driver: WebDriver, command: CommandInput) {
  const element = await driver.findElement(By.css("body"));
  const key = toGameboyAdvanceKeyInput(command.command);
  for (let i = 0; i < command.quantity; i++) {
    if (command.modifier === undefined) {
      await driver.actions().click(element).keyDown(key).pause(configuration.keyPressDuration).keyUp(key).perform();
    } else if (isBurst(command.modifier)) {
      for (let i = 0; i < configuration.burstPressQuantity; i++) {
        await driver.actions().click(element).keyDown(key).pause(configuration.burstPressDuration).keyUp(key).perform();
        if (configuration.burstPressDelay > 0) {
          await delay(configuration.burstPressDelay);
        }
      }
    } else if (isHold(command.modifier)) {
      await driver.actions().click(element).keyDown(key).pause(configuration.holdDuration).keyUp(key).perform();
    } else if (isHoldB(command.modifier)) {
      await driver
        .actions()
        .click(element)
        .keyDown("X")
        .keyDown(key)
        .pause(configuration.holdDuration)
        .keyUp(key)
        .keyUp("X")
        .perform();
    } else {
      console.error("unknown");
      throw new Error(`unknown modifier ${JSON.stringify(command)}`);
    }
  }
}
