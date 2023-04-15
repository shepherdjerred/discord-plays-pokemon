import { KeyInput } from "puppeteer";
import { Command, isLeft, isRight, isUp, isDown, isA, isB, isSelect, isStart, isSave, isLoad } from "./command.js";
import { parseChord } from "./chord.js";
import { CommandInput } from "./commandInput.js";

export function toGameboyAdvanceKeyInput(command: Command): KeyInput {
  if (isLeft(command)) return "ArrowLeft";
  if (isRight(command)) return "ArrowRight";
  if (isUp(command)) return "ArrowUp";
  if (isDown(command)) return "ArrowDown";
  if (isA(command)) return "X";
  if (isB(command)) return "Z";
  if (isSelect(command)) return "Shift";
  if (isStart(command)) return "Enter";
  if (isSave(command)) return "F2";
  if (isLoad(command)) return "F4";
  throw Error("illegal command");
}

export function commandToGameboyAdvanceKeyInput(command: CommandInput): KeyInput[] {
  const keys: KeyInput[] = [];
  for (let i = 0; i < command.quantity; i++) {
    keys.push(toGameboyAdvanceKeyInput(command.command));
  }
  return keys;
}

export function parseGameboyAdvanceKeyInput(input: string): KeyInput[] | undefined {
  return parseChord(input)?.flatMap(commandToGameboyAdvanceKeyInput);
}
