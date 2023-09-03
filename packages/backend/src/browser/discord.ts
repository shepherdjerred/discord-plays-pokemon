import { By, WebDriver, until } from "selenium-webdriver";
import { wait } from "../util.js";
import { config } from "../config/index.js";
import { logger } from "../logger.js";

export async function setupDiscord(driver: WebDriver) {
  if (await isLoggedIn(driver)) {
    logger.info("already logged in");
  } else {
    logger.info("logged in");
    await login(driver);
  }
  await updateSettings(driver);
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
  const delay = 2000;
  logger.info(`waiting ${delay}ms for text channel to become clickable`);
  await wait(delay);
  await textChat.click();
  logger.info("navigated to text channel");
}

async function updateSettings(driver: WebDriver) {
  logger.info("executing script to update local storage");
  // https://stackoverflow.com/questions/52509440/discord-window-localstorage-is-undefined-how-to-get-access-to-the-localstorage
  await driver.executeScript(`
    (() => {
      const iframe = document.createElement('iframe');
      document.head.append(iframe);
      const localStorage = Object.getOwnPropertyDescriptor(iframe.contentWindow, 'localStorage');

      con

      const currentSettings = JSON.parse(localStorage.getItem("MediaEngineStore"));
      currentSettings.default.outputVolume = 0;
      currentSettings.stream.outputVolume = 0;
      currentSettings.default.modeOptions.threshold = -100;
      currentSettings.stream.modeOptions.threshold = -100;
      currentSettings.default.echoCancellation = false;
      currentSettings.stream.echoCancellation = false;
      currentSettings.default.automaticGainControl = false;
      currentSettings.stream.automaticGainControl = false;
      localStorage.setItem("MediaEngineStore", JSON.stringify(currentSettings));
      iframe.remove();
    })()
  `);
  logger.info("refreshing page to update settings");
  await driver.navigate().refresh();
}

async function joinVoiceChat(driver: WebDriver) {
  logger.info("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${config.stream.channel_id}"]`;
  const voiceChatButton = await driver.wait(until.elementLocated(By.css(voiceChannelSelector)));
  logger.info("joined voice chat");
  await voiceChatButton.click();
}

export async function shareScreen(driver: WebDriver) {
  logger.info("trying to share screen");
  const videoShareSelector = 'button[aria-label="Share Your Screen"]';
  const videoShareButton = await driver.wait(until.elementLocated(By.css(videoShareSelector)));
  logger.info("clicking sharing screen button");
  await videoShareButton.click();
}

export async function stopShareScreen(driver: WebDriver) {
  logger.info("trying to stop screen sharing");
  const videoShareSelector = 'button[aria-label="Share Your Screen"]';
  const videoShareButton = await driver.wait(until.elementLocated(By.css(videoShareSelector)));
  logger.info("clicking sharing screen button");
  await videoShareButton.click();
}
