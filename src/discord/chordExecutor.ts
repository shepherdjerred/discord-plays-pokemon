import { Page } from "puppeteer";
import { delay } from "../util.js";
import { commandToGameboyAdvanceKeyInput } from "../command/keybinds.js";
import { Chord } from "../command/chord.js";
import configuration from "../configuration.js";

export async function execute(chord: Chord, page: Page) {
  for (const commandInput of chord) {
    const keys = commandToGameboyAdvanceKeyInput(commandInput);
    for (const key of keys) {
      console.log(`sending ${JSON.stringify(key)}`);
      await page.keyboard.press(key, {
        delay: configuration.keyPressDuration,
      });
      await delay(configuration.commandQuantityInterval);
    }
  }
}
