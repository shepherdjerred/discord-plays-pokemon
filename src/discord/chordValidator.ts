import { type Chord } from "../command/chord.js";
import configuration from "../configuration.js";

export function isValid(chord: Chord): boolean {
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
  return true;
}
