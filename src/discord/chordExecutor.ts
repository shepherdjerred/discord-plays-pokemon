import { delay } from "../util.js";
import { Chord } from "../command/chord.js";
import configuration from "../configuration.js";
import { CommandInput } from "../command/commandInput.js";

export async function execute(chord: Chord, fn: (commandInput: CommandInput) => Promise<void>) {
  for (const commandInput of chord) {
    await fn(commandInput);
    if (configuration.chordDelay > 0) {
      await delay(configuration.commandQuantityInterval);
    }
  }
}
