import { By, WebDriver, until } from "selenium-webdriver";
import configuration from "../configuration.js";
import { delay } from "../util.js";

export async function setupDiscord(driver: WebDriver) {
  if (await isLoggedIn(driver)) {
    console.log("already logged in");
  } else {
    console.log("logged in");
    await login(driver);
  }
  await navigateToTextChannel(driver);
  await joinVoiceChat(driver);
  await shareScreen(driver);
}

async function isLoggedIn(driver: WebDriver): Promise<boolean> {
  console.log("going to main app page");
  const appPage = "https://discord.com/app";
  await driver.get(appPage);
  console.log("waiting for redirect");
  await driver.wait(async (driver) => {
    return (await driver.getCurrentUrl()) != appPage;
  });
  const url = await driver.getCurrentUrl();
  if (url.startsWith("https://discord.com/login")) {
    console.log("not logged in");
    return false;
  } else {
    console.log("already logged in");
    return true;
  }
}

async function login(driver: WebDriver) {
  console.log("logging in via website");
  await driver.get("https://discord.com/login");

  console.log("typing email");
  const emailInput = driver.wait(until.elementLocated(By.css("input[name=email]")));
  await emailInput.sendKeys(configuration.username);

  console.log("typing password");
  const passwordInput = driver.wait(until.elementLocated(By.css("input[name=password]")));
  await passwordInput.sendKeys(configuration.password);

  console.log("click submit button");
  const submitButton = driver.wait(until.elementLocated(By.css("button[type=submit]")));
  await submitButton.click();

  console.log("waiting for redirect");
  await driver.wait(until.urlContains("https://discord.com/channels/"));
  console.log("logged in");
}

async function navigateToTextChannel(driver: WebDriver) {
  console.log("navigating to text channel");
  const textChannelUrl = `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`;
  await driver.get(textChannelUrl);
  console.log("waiting for text channel to be listed");
  const textChat = await driver.wait(
    until.elementLocated(By.css(`a[data-list-item-id="channels___${configuration.textChannelId}"]`))
  );
  // TODO
  await delay(5000);
  await textChat.click();
  console.log("navigated to text channel");
}

async function joinVoiceChat(driver: WebDriver) {
  console.log("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;
  const voiceChatButton = await driver.wait(until.elementLocated(By.css(voiceChannelSelector)));
  console.log("joined voice chat");
  await voiceChatButton.click();
}

async function shareScreen(driver: WebDriver) {
  console.log("trying to share screen");
  const videoShareSelector = 'button[aria-label="Share Your Screen"]';
  const videoShareButton = await driver.wait(until.elementLocated(By.css(videoShareSelector)));
  console.log("joined sharing screen");
  await videoShareButton.click();
}
