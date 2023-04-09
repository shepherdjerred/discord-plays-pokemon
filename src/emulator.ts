import { Page } from "puppeteer-core";
import { delay } from "./util.js";


export async function setupGame(emulatorPage: Page) {
  console.log("connecting");
  await emulatorPage.goto("http://emulator");
  console.log("connected");

  await emulatorPage.keyboard.press("ArrowRight");
  delay(1000);

  await emulatorPage.keyboard.press("ArrowRight");
  delay(1000);
}
