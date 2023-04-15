import { Page } from "puppeteer";
import configuration from "../configuration.js";
import fs from "fs/promises";

const cookiesFile = `${configuration.userDataPath}/cookies.json`;

async function loginToDiscordWebsite(page: Page) {
  try {
    const contents = (await fs.readFile(cookiesFile)).toString("utf-8");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookies = JSON.parse(contents);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await page.setCookie(...cookies);
  } catch (error) {
    console.log(error);
  }

  await navigateToTextChannel(page);
  if (page.url().startsWith("https://discord.com/login")) {
    console.log("not logged in");
  } else {
    console.log(page.url());
    console.log("already logged in");
    return;
  }

  console.log("logging in via website");
  // submit
  try {
    const retryLogin = await page.waitForSelector("button[type=submit]", {
      visible: true,
    });
    if (retryLogin) {
      await retryLogin.click();
    }
  } catch (e) {
    // ignore
    console.log("could not find retry login button");
  }

  // enter email
  const emailtarget = await page.waitForSelector("input[name=email]", {
    visible: true,
  });
  if (emailtarget) {
    await emailtarget.type(configuration.username);
  }

  // enter password
  const passtarget = await page.waitForSelector("input[name=password]", {
    visible: true,
  });
  if (passtarget) {
    await passtarget.type(configuration.password);
  }

  // submit
  const submitBtn = await page.waitForSelector("button[type=submit]", {
    visible: true,
  });
  if (submitBtn) {
    await submitBtn.click();
  }

  // wait for redirection
  await page.waitForNavigation();
  console.log("logged in");

  const cookiesToSave = await page.cookies();
  const cookiesToSaveJson = JSON.stringify(cookiesToSave);
  await fs.writeFile(cookiesFile, cookiesToSaveJson);
}

export async function navigateToTextChannel(page: Page) {
  const channelUrl = `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`;
  await page.goto(channelUrl, {
    waitUntil: "networkidle0",
  });
}

export async function joinVoiceChat(page: Page) {
  await loginToDiscordWebsite(page);

  console.log("trying to join voice chat");
  const channelUrl = `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`;
  await page.goto(channelUrl, {
    waitUntil: "networkidle0",
  });

  const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;
  const target = await page.waitForSelector(voiceChannelSelector);
  if (target) {
    await target.click();
    console.log("joined voice chat");
  }
}

export async function shareScreen(page: Page) {
  await joinVoiceChat(page);

  console.log("trying to share screen");
  const videoSelector = 'button[aria-label="Share Your Screen"]';
  const target = await page.waitForSelector(videoSelector);
  if (target) {
    await target.click();
    console.log("screen sharing on");
  }
}
