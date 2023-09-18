import { WebDriver, until, By } from "selenium-webdriver";
import { getConfig } from "../../config/index.js";
import { logger } from "../../logger.js";

export async function joinVoiceChat(driver: WebDriver) {
  logger.info("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${getConfig().stream.channel_id}"]`;
  const voiceChatButton = await driver.wait(until.elementLocated(By.css(voiceChannelSelector)));

  logger.info("joined voice chat");
  await voiceChatButton.click();
}

export async function disconnect(driver: WebDriver) {
  logger.info("trying to disconnect");
  await driver.switchTo().window((await driver.getAllWindowHandles())[0]);
  const disconnectSelector = 'button[aria-label="Disconnect"]';
  const disconnectButton = await driver.wait(until.elementLocated(By.css(disconnectSelector)));

  logger.info("clicking disconnect button");
  await disconnectButton.click();
}
