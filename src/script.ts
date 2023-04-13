import { Browser, launch } from "puppeteer";
import { setupGame, startGame } from "./emulator.js";
import { shareScreen } from "./discord.js";
import { handleCommands } from "./commandHandler.js";

async function startBrowser(): Promise<Browser> {
  console.log("starting browser");
  const width = 1920;
  const height = 1080;
  const browser = await launch({
    executablePath: "google-chrome-stable",
    userDataDir: "/home/pptruser/data",
    args: [
      "--enable-usermedia-screen-capturing",
      `--auto-select-desktop-capture-source=EmulatorJS`,
      `--window-size=${width},${height}`,
      `--ignore-gpu-blacklist`,
      `--no-sandbox`,
      `--use-gl=desktop`
    ],
    headless: false,
  });
  return browser;
}

const browser = await startBrowser();
const gpu = await browser.newPage();
gpu.goto("chrome://gpu");
gpu.bringToFront();
const emulatorPage = (await browser.pages())[0];
await setupGame(emulatorPage);
const discordPage = await browser.newPage();
await shareScreen(discordPage);
await startGame(emulatorPage);
await handleCommands(emulatorPage);
(await browser.newPage()).bringToFront();
