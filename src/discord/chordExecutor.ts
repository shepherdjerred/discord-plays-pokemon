import { delay } from "../util.js";
import { KeyInput, commandToGameboyAdvanceKeyInput } from "../command/keybinds.js";
import { Chord } from "../command/chord.js";
import configuration from "../configuration.js";

export async function execute(chord: Chord, fn: (key: KeyInput) => Promise<void>) {
  for (const commandInput of chord) {
    const keys = commandToGameboyAdvanceKeyInput(commandInput);
    for (const key of keys) {
      console.log(`sending ${JSON.stringify(key)}`);
      await fn(key);
      await delay(configuration.commandQuantityInterval);
    }
  }
}
