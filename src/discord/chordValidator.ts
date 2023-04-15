import { type Chord } from "../command/chord.js";
import { isSave, isLoad, Command } from "../command/command.js";
import configuration from "../configuration.js";

export async function isValid(chord: Chord, sender: string): Promise<boolean> {
  if (chord.length > configuration.chordMaxCommands) {
    return false;
  }
  const highQuantityCommands = chord.filter((command) => command.quantity > configuration.commandMaxQuantity);
  if (highQuantityCommands.length > 0) {
    return false;
  }
  const total = chord.map((command) => command.quantity).reduce((a, b) => a + b, 0);
  if (total > configuration.chordMaxTotal) {
    return false;
  }
  const hasRestrictedCommand = chord.filter((command) => {
    return isRestricted(command.command);
  });
  if (hasRestrictedCommand.length) {
    if (!configuration.trustedUsers.includes(sender)) {
      return false;
    }
  }
  return true;
}

export function isRestricted(command: Command) {
  return isSave(command) && isLoad(command);
}
