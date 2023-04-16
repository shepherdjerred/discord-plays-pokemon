import { Browser, launch } from "puppeteer";
import { saveGame, setupGame } from "./puppeteer/emulator.js";
import { joinVoiceChat, login, shareScreen } from "./puppeteer/discord.js";
import { handleMessages } from "./discord/messageHandler.js";
import configuration from "./configuration.js";
import { delay } from "./util.js";

const width = configuration.width;
const height = configuration.height;

async function startBrowser(): Promise<Browser> {
  console.log("starting browser");
  const browser = await launch({
    product: "firefox",
    executablePath: "firefox",
    userDataDir: configuration.userDataPath,
    args: [],
    headless: false,
  });
  return browser;
}

const browser = await startBrowser();

const emulatorPage = (await browser.pages())[0];
await setupGame(emulatorPage);

const discordPage = await browser.newPage();
await login(discordPage);
await joinVoiceChat(discordPage);
await shareScreen(discordPage);

handleMessages(emulatorPage);
await emulatorPage.setViewport({
  height,
  width,
});

while (true) {
  await delay(1000 * configuration.autosaveIntervalInSeconds);
  console.log("saving game");
  await saveGame(emulatorPage);
}
