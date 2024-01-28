import { WebDriver, until, By } from "selenium-webdriver";
import { logger } from "../../logger.js";

export async function shareScreen(driver: WebDriver) {
  logger.info("trying to share screen");
  const videoShareSelector = 'button[aria-label="Share Your Screen"]';
  const videoShareButton = await driver.wait(until.elementLocated(By.css(videoShareSelector)));
  logger.info("clicking sharing screen button");
  await videoShareButton.click();
}

export async function stopShareScreen(driver: WebDriver) {
  logger.info("trying to stop screen sharing");
  const videoShareSelector = 'button[aria-label="Stop Streaming"]';
  const videoShareButton = await driver.wait(until.elementLocated(By.css(videoShareSelector)));
  logger.info("clicking stop sharing screen button");
  await videoShareButton.click();
}
