import puppeteer, { Browser, launch } from "puppeteer";
import { handleCommands } from "./commands.js";
import { setupGame } from "./emulator.js";
import { shareScreen } from "./discord.js";

async function startBrowser(): Promise<Browser> {
  console.log("starting browser");
  const browser = await launch({
    executablePath: puppeteer.executablePath(),
    userDataDir: "/home/pptruser/data",
    args: [
      "--enable-usermedia-screen-capturing",
      "--auto-select-desktop-capture-source=red",
    ],
    defaultViewport: {
      width: 640,
      height: 576,
    },
    headless: false,
  });
  return browser;
}

const browser = await startBrowser();
const emulatorPage = await browser.newPage();
await setupGame(emulatorPage);
const discordPage = await browser.newPage();
await shareScreen(discordPage);
await emulatorPage.bringToFront();

handleCommands(emulatorPage);
