import puppeteer from "puppeteer";
import { Browser } from "puppeteer-core";
import { launch } from "puppeteer-stream";
import { handleCommands } from "./commands.js";
import {
  setupGame,
  streamPageToVirtualDisplay as streamPageToVirtualCamera,
} from "./emulator.js";
import { shareScreen } from "./discord.js";

async function startBrowser(): Promise<Browser> {
  console.log("starting browser");
  const browser = await launch({
    executablePath: puppeteer.executablePath(),
    userDataDir: "/home/pptruser/data",
    args: [
      "--enable-usermedia-screen-capturing",
      "--auto-select-desktop-capture-source=Entire Screen",
    ],
    defaultViewport: {
      width: 1280,
      height: 720,
    },
  });

  console.log("overriding permissions");
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://discord.com", [
    "camera",
    "microphone",
  ]);
  return browser;
}

const browser = await startBrowser();
const emulatorPage = await browser.newPage();
await setupGame(emulatorPage);
const discordPage = await browser.newPage();
await shareScreen(discordPage);
await emulatorPage.bringToFront();

handleCommands(emulatorPage);
