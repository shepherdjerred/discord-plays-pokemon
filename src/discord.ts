import { Page } from "puppeteer";
import configuration from "./configuration.js";

async function loginToDiscordWebsite(page: Page) {
  await navigateToTextChannel(page);
  if (page.url().startsWith("https://discord.com/login")) {
    console.log("not logged in");
  } else {
    console.log(page.url());
    console.log("already logged in");
    return;
  }

  console.log("logging in");
  // enter email
  const emailtarget = await page.waitForSelector("input[name=email]", {
    visible: true,
  });
  await emailtarget!.type(configuration.username);

  // enter password
  const passtarget = await page.waitForSelector("input[name=password]", {
    visible: true,
  });
  await passtarget!.type(configuration.password);

  // submit
  const submitBtn = await page.waitForSelector("button[type=submit]", {
    visible: true,
  });
  await submitBtn!.click();

  // wait for redirection
  await page.waitForNavigation();
  console.log("logged in");
}

export async function navigateToTextChannel(page: Page) {
  const channelUrl = `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`;
  await page.goto(channelUrl, {
    waitUntil: "networkidle0",
  });
}

export async function joinVoiceChat(page: Page) {
  await loginToDiscordWebsite(page);
  // Attempt to join the voice channel.
  console.log("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;
  await page.waitForSelector(voiceChannelSelector, { timeout: 0 });
  await page.evaluate(
    (v) => (document.querySelector(v)! as any).click(),
    voiceChannelSelector
  );
}

export async function shareScreen(page: Page) {
  await joinVoiceChat(page);

  console.log("trying to share screen");
  const videoSelector = 'button[aria-label="Share Your Screen"]';
  await page.waitForSelector(videoSelector, { timeout: 0 });
  await page.evaluate(
    (v) => (document.querySelector(v)! as any).click(),
    videoSelector
  );
  console.log("screen sharing on");
}
