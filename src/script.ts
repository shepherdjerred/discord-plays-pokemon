import { Browser, launch } from "puppeteer";
import { setupGame } from "./emulator.js";
import { shareScreen } from "./discord.js";
import configuration from "./configuration.js";

async function startBrowser(): Promise<Browser> {
  console.log("starting browser");
  const width = 1280;
  const height = 720;
  const browser = await launch({
    executablePath: "google-chrome-stable",
    userDataDir: "/home/pptruser/data",
    args: [
      "--enable-usermedia-screen-capturing",
      `--auto-select-desktop-capture-source=${configuration.romName}`,
      `--window-size=${width},${height}`,
    ],
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

// await handleCommands(emulatorPage);
