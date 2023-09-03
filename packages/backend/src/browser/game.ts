import { By, WebDriver, until } from "selenium-webdriver";
import { CommandInput, isBurst, isHold, isHoldB } from "../command/commandInput.js";
import { toGameboyAdvanceKeyInput } from "../command/keybinds.js";
import { wait } from "../util.js";
import { config } from "../config/index.js";
import { getLatestSave } from "../saves/index.js";
import { logger } from "../logger.js";

export async function setupGame(driver: WebDriver) {
  logger.info("navigating to emulator page");
  if (config.game.emulator_url === "built_in") {
    await driver.get(`http://localhost:${config.web.port}/emulator.html`);
  } else {
    await driver.get(config.game.emulator_url);
  }
  await wait(5000);
  logger.info("selecting frame");
  await focusContentFrame(driver);
  logger.info("waiting for play now button");
  const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
  logger.info("clicking play now button");
  await playNowButton.click();
  logger.info("clicked button");
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
        await wait(config.game.commands.burst.delay_in_milliseconds);
      }
    }
    return;
  }

  logger.error("unknown");
  throw new Error(`unknown modifier ${JSON.stringify(command)}`);
}

export async function exportSave(driver: WebDriver) {
  await focusGameFrame(driver);
  logger.info("waiting for export save button");
  const exportSaveButton = await driver.wait(until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div[4]")));
  logger.info("clicking export save button");
  await exportSaveButton.click();
  logger.info("clicked export button");
}

export async function importSave(driver: WebDriver) {
  const latestSave = await getLatestSave();

  if (latestSave) {
    logger.info("latest save is ", latestSave);
    await focusMainFrame(driver);

    logger.info("finding upload button");
    await driver.findElement(By.css("#upload")).sendKeys(latestSave);
    logger.info("uploaded save");
    await wait(1000);
  } else {
    logger.info("no save to load");
  }
}

export async function focusMainFrame(driver: WebDriver) {
  await driver.switchTo().defaultContent();
  const element = await driver.findElement(By.css("body"));
  await element.click();
}

export async function focusContentFrame(driver: WebDriver) {
  await driver.switchTo().defaultContent();
  const frame = await driver.findElement(By.id("ejs-content-frame"));
  await driver.switchTo().frame(frame);
}

export async function focusGameFrame(driver: WebDriver) {
  await focusContentFrame(driver);
  const frame = await driver.findElement(By.id("game-frame"));
  await driver.switchTo().frame(frame);
}

export async function fullscreenGame(driver: WebDriver) {
  await wait(500);

  await focusGameFrame(driver);
  logger.info("waiting for fullscreen button");
  const fullscreenButton = await driver.wait(until.elementLocated(By.css("[data-btn=fullscreen]")));

  logger.info("clicking fullscreen button");
  const actions = driver.actions({ async: true });
  await actions
    .move(await fullscreenButton.getLocation())
    .click(fullscreenButton)
    .perform();
  logger.info("clicked fullscreen button");
}
