import { By, WebDriver, until } from "selenium-webdriver";
import { delay } from "../util.js";
import { config } from "../config/index.js";
import { logger } from "../logger.js";

export async function setupDiscord(driver: WebDriver) {
  if (await isLoggedIn(driver)) {
    logger.info("already logged in");
  } else {
    logger.info("logged in");
    await login(driver);
  }
  await navigateToTextChannel(driver);
  await joinVoiceChat(driver);
  await shareScreen(driver);
}

async function isLoggedIn(driver: WebDriver): Promise<boolean> {
  logger.info("going to main app page");
  const appPage = "https://discord.com/app";
  await driver.get(appPage);
  logger.info("waiting for redirect");
  await driver.wait(async (driver) => {
    return (await driver.getCurrentUrl()) != appPage;
  });
  const url = await driver.getCurrentUrl();
  if (url.startsWith("https://discord.com/login")) {
    logger.info("not logged in");
    return false;
  } else {
    logger.info("already logged in");
    return true;
  }
}

async function login(driver: WebDriver) {
  logger.info("logging in via website");
  await driver.get("https://discord.com/login");

  logger.info("typing email");
  const emailInput = driver.wait(until.elementLocated(By.css("input[name=email]")));
  await emailInput.sendKeys(config.stream.userbot.username);

  logger.info("typing password");
  const passwordInput = driver.wait(until.elementLocated(By.css("input[name=password]")));
  await passwordInput.sendKeys(config.stream.userbot.password);

  logger.info("click submit button");
  const submitButton = driver.wait(until.elementLocated(By.css("button[type=submit]")));
  await submitButton.click();

  logger.info("waiting for redirect");
  await driver.wait(until.urlContains("https://discord.com/channels/"));
  logger.info("logged in");
}

async function navigateToTextChannel(driver: WebDriver) {
  logger.info("navigating to text channel");
  const textChannelUrl = `https://discord.com/channels/${config.server_id}/${config.game.commands.channel_id}`;
  await driver.get(textChannelUrl);
  logger.info("waiting for text channel to be listed");
  const textChat = await driver.wait(
    until.elementLocated(By.css(`a[data-list-item-id="channels___${config.game.commands.channel_id}"]`)),
  );
  // TODO remove this arbitrary delay and instead test for something else
  await delay(5000);
  await textChat.click();
  logger.info("navigated to text channel");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function goToSettings(driver: WebDriver) {
  logger.info("going to settings");
  const settingsButtonSelector = 'button[aria-label="User Settings"]';
  const settingsButton = await driver.wait(until.elementLocated(By.css(settingsButtonSelector)));
  logger.info("at settings");
  await settingsButton.click();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function goToVoiceTab(driver: WebDriver) {
  logger.info("going to voice settings");
  const settingsButtonSelector = 'button[aria-controls="voice-&-video-tab"]';
  const settingsButton = await driver.wait(until.elementLocated(By.css(settingsButtonSelector)));
  logger.info("at voice settings");
  await settingsButton.click();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateSettings(driver: WebDriver) {
  // Move output volume
  // Update input sensitivity
  // Disable echo cancellation
}

async function joinVoiceChat(driver: WebDriver) {
  logger.info("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${config.stream.channel_id}"]`;
  const voiceChatButton = await driver.wait(until.elementLocated(By.css(voiceChannelSelector)));
  logger.info("joined voice chat");
  await voiceChatButton.click();
}

async function shareScreen(driver: WebDriver) {
  logger.info("trying to share screen");
  const videoShareSelector = 'button[aria-label="Share Your Screen"]';
  const videoShareButton = await driver.wait(until.elementLocated(By.css(videoShareSelector)));
  logger.info("joined sharing screen");
  await videoShareButton.click();
}
