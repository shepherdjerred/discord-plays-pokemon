import { Page } from "puppeteer";
import { delay } from "./util.js";

export async function setupGame(emulatorPage: Page) {
  console.log("navigating to emulator webpage");
  await emulatorPage.goto("http://emulator");

  console.log("pressed right arrow");
  await emulatorPage.keyboard.press("ArrowRight");
  await delay(1000);

  console.log("pressed right arrow");
  await emulatorPage.keyboard.press("ArrowRight");
  await delay(1000);

  console.log("navigated to the game page");
}
