import { By, WebDriver, until } from "selenium-webdriver";
import { CommandInput, isBurst, isHold, isHoldB } from "../command/commandInput.js";
import { toGameboyAdvanceKeyInput } from "../command/keybinds.js";
import { delay } from "../util.js";
import { config } from "../config/index.js";
import { getLatestSave } from "../saves/index.js";

export async function setupGame(driver: WebDriver) {
  console.log("navigating to emulator page");
  if (config.game.emulator_url === "built_in") {
    await driver.get(`http://localhost:${config.web.port}/emulator.html`);
  } else {
    await driver.get(config.game.emulator_url);
  }
  await delay(5000);
  console.log("selecting frame");
  await focusContentFrame(driver);
  console.log("waiting for play now button");
  const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
  console.log("clicking play now button");
  await playNowButton.click();
  console.log("clicked button");
}

export async function sendGameCommand(driver: WebDriver, command: CommandInput) {
  await focusContentFrame(driver);
  const element = await driver.findElement(By.css("body"));
  const key = toGameboyAdvanceKeyInput(command.command);
  if (!command.modifier) {
    for (let i = 0; i < command.quantity; i++) {
      await driver
        .actions()
        .click(element)
        .keyDown(key)
        .pause(config.game.commands.key_press_duration_in_milliseconds)
        .keyUp(key)
        .perform();
    }
    return;
  }
  if (isHoldB(command.modifier)) {
    await driver
      .actions()
      .click(element)
      .sendKeys("X", key)
      .pause(config.game.commands.hold.duration_in_milliseconds * command.quantity)
      .keyUp(key)
      .keyUp("X")
      .perform();
    return;
  } else if (isHold(command.modifier)) {
    await driver
      .actions()
      .click(element)
      .keyDown(key)
      .pause(config.game.commands.hold.duration_in_milliseconds)
      .keyUp(key)
      .perform();
    return;
  }

  if (isBurst(command.modifier)) {
    for (let i = 0; i < config.game.commands.burst.quantity * command.quantity; i++) {
      await driver
        .actions()
        .click(element)
        .keyDown(key)
        .pause(config.game.commands.burst.duration_in_milliseconds)
        .keyUp(key)
        .perform();
      if (config.game.commands.burst.delay_in_milliseconds > 0) {
        await delay(config.game.commands.burst.delay_in_milliseconds);
      }
    }
    return;
  }

  console.error("unknown");
  throw new Error(`unknown modifier ${JSON.stringify(command)}`);
}

export async function exportSave(driver: WebDriver) {
  await focusGameFrame(driver);
  console.log("waiting for export save button");
  const exportSaveButton = await driver.wait(until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div[4]")));
  console.log("clicking export save button");
  await exportSaveButton.click();
  console.log("clicked export button");
}

export async function importSave(driver: WebDriver) {
  const latestSave = await getLatestSave();

  if (latestSave) {
    console.log("latest save is ", latestSave);
    await focusMainFrame(driver);

    console.log("finding upload button");
    await driver.findElement(By.css("#upload")).sendKeys(latestSave);
    console.log("uploaded save");
    await delay(1000);
  } else {
    console.log("no save to load");
  }
}

async function focusMainFrame(driver: WebDriver) {
  await driver.switchTo().defaultContent();
  const element = await driver.findElement(By.css("body"));
  await element.click();
}

async function focusContentFrame(driver: WebDriver) {
  await driver.switchTo().defaultContent();
  const frame = await driver.findElement(By.id("ejs-content-frame"));
  await driver.switchTo().frame(frame);
  const element = await driver.findElement(By.css("body"));
  await element.click();
}

async function focusGameFrame(driver: WebDriver) {
  await focusContentFrame(driver);
  const frame = await driver.findElement(By.id("game-frame"));
  await driver.switchTo().frame(frame);
  const element = await driver.findElement(By.css("body"));
  await element.click();
}
