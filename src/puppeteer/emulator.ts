import { ElementHandle, Page } from "puppeteer";

export async function setupGame(page: Page) {
  console.log("navigating to emulator page");
  await page.goto("http://server");
  const [playNowButton] = (await page.$x('//a[text()="Play Now"]')) as ElementHandle[];
  console.log("clicking play now button");
  await playNowButton.click();
  console.log("clicked button");
}

export async function saveGame(page: Page) {
  await page.keyboard.press("F2");
}
