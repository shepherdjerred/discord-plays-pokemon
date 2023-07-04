import { By, WebDriver, until } from "selenium-webdriver";
import { CommandInput, isBurst, isHold, isHoldB } from "../command/commandInput.js";
import { toGameboyAdvanceKeyInput } from "../command/keybinds.js";
import { delay } from "../util.js";
import { config } from "../config/index.js";

export async function setupGame(driver: WebDriver) {
  console.log("navigating to emulator page");
  await driver.get(`http://localhost:${config.web.port}/emulator.html`);
  await delay(10000);
  console.log("selecting frame");
  const frame = await driver.findElement(By.id("ejs-content-frame"));
  await driver.switchTo().frame(frame);
  console.log("waiting for play now button");
  const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
  console.log("clicking play now button");
  await playNowButton.click();
  console.log("clicked button");
}

export async function sendGameCommand(driver: WebDriver, command: CommandInput) {
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
  console.log("waiting for export save button");
  const exportSaveButton = await driver.wait(until.elementLocated(By.css('div[title="Export save file"]')));
  console.log("clicking export save button");
  await exportSaveButton.click();
  console.log("clicked button");
  // TODO: diff
  // TODO: upload to chat
}

export async function importSave(driver: WebDriver) {
  console.log("waiting for import save button");
  const importSaveButton = await driver.wait(until.elementLocated(By.css('div[title="Import save file"]')));
  console.log("clicking import save button");
  await importSaveButton.click();
  console.log("clicked button");
  // TODO select file
}

export async function loopExportSave(driver: WebDriver) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
  while (true) {
    await exportSave(driver);
    // TODO: use config
    await delay(10000);
  }
}
