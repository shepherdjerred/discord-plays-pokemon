import { Page } from "puppeteer";
import configuration from "../configuration.js";
import fs from "fs/promises";

const cookiesFile = `${configuration.userDataPath}/cookies.json`;
const textChannelUrl = `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`;

async function saveCookies(page: Page) {
  const cookiesToSave = await page.cookies();
  const cookiesToSaveJson = JSON.stringify(cookiesToSave);
  await fs.writeFile(cookiesFile, cookiesToSaveJson);
}

async function loadCookies(page: Page) {
  try {
    const contents = (await fs.readFile(cookiesFile)).toString("utf-8");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookies = JSON.parse(contents);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await page.setCookie(...cookies);
  } catch (error) {
    console.log(error);
  }
}

async function isLoggedIn(page: Page): Promise<boolean> {
  await navigateToTextChannel(page);
  if (page.url().startsWith("https://discord.com/login")) {
    console.log("not logged in");
    return false;
  } else {
    console.log(page.url());
    console.log("already logged in");
    return true;
  }
}

async function retryLogin(page: Page) {
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
}

export async function login(page: Page) {
  console.log("logging in via website");
  await page.goto("https://discord.com/login");
  await loadCookies(page);
  // if (await isLoggedIn(page)) {
  // return;
  // }

  await retryLogin(page);

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
  await saveCookies(page);
  console.log("logged in");
}

export async function navigateToTextChannel(page: Page) {
  console.log("navigating to text channel");
  // firefox is bizarre
  try {
    await page.goto(textChannelUrl, {
      timeout: 5000,
    });
  } catch {
    console.log("timeout expected");
  }
  console.log("navigated to text channel");
}

export async function joinVoiceChat(page: Page) {
  console.log("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;
  const target = await page.waitForSelector(voiceChannelSelector);
  if (target) {
    await target.click();
    console.log("joined voice chat");
  } else {
    console.error("could not join voice chat");
  }
}

export async function shareScreen(page: Page) {
  console.log("trying to share screen");
  const videoSelector = 'button[aria-label="Share Your Screen"]';
  const target = await page.waitForSelector(videoSelector);
  if (target) {
    await target.click();
    console.log("screen sharing on");
  } else {
    console.error("could not share screen");
  }
}
