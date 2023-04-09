import { Page } from "puppeteer-core";
import configuration from "./configuration.js";
import { exit } from "process";

async function loginToDiscordWebsite(page: Page) {
  navigateToTextChannel(page)
  if (page.url().startsWith("https://discord.com/login")) {
    console.log("not logged in");
  } else {
    console.log(page.url());
    console.log("already logged in");
    return;
  }

    console.log("loggging in");
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

  export async function turnCameraOn(page: Page) {
    await joinVoiceChat(page);
    console.log("looking for camera button")
    try {
      await page.waitForSelector('button[aria-label="Camera Unavailable"]', {
        timeout: 15000,
      });
      console.log("camera not working...");
      exit(1);
    } catch (error) {
      console.log("camera is working 🎉🎉🎉");
    }

    console.log("turning on video");
    const videoSelector = 'button[aria-label="Turn On Camera"]';
    await page.waitForSelector(videoSelector, { timeout: 0 });
    await page.evaluate(
      (v) => (document.querySelector(v)! as any).click(),
      videoSelector
    );

    console.log("video is streaming...");
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
