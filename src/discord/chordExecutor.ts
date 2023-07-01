import { delay } from "../util.js";
import { Chord } from "../command/chord.js";
import { CommandInput } from "../command/commandInput.js";
import { config } from "../config/index.js";

export async function execute(chord: Chord, fn: (commandInput: CommandInput) => Promise<void>) {
  for (const commandInput of chord) {
    await fn(commandInput);
    if (config.commands.chord.delay > 0) {
      await delay(config.commands.delay_between_actions_in_milliseconds);
    }
  }
}
