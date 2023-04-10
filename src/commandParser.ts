import { KeyInput } from "puppeteer";
import _ from "lodash";

const left = ["left", "l"];
type Left = (typeof left)[number];
function isLeft(input: string): input is Left {
  return left.includes(input);
}

const right = ["right", "r"];
type Right = (typeof right)[number];
function isRight(input: string): input is Right {
  return right.includes(input);
}

const up = ["up", "u"];
type Up = (typeof up)[number];
function isUp(input: string): input is Up {
  return up.includes(input);
}

const down = ["down", "d"];
type Down = (typeof down)[number];
function isDown(input: string): input is Down {
  return down.includes(input);
}

const a = ["a"];
type A = (typeof a)[number];
function isA(input: string): input is A {
  return a.includes(input);
}

const b = ["b"];
type B = (typeof b)[number];
function isB(input: string): input is B {
  return b.includes(input);
}

const select = ["select", "se"];
type Select = (typeof select)[number];
function isSelect(input: string): input is Select {
  return select.includes(input);
}

const start = ["start", "st"];
type Start = (typeof start)[number];
function isStart(input: string): input is Start {
  return start.includes(input);
}

const command = [...left, ...right, ...up, ...down, ...a, ...b, ...select, ...start];
type Command = (typeof command)[number];
function isCommand(input: string): input is Command {
  return command.includes(input.toLowerCase());
}

type Chord = CommandInput[];

interface CommandInput {
  command: Command;
  quantity: number;
}

export function toKeyInput(command: Command): KeyInput {
  if (isLeft(command)) return "ArrowLeft";
  if (isRight(command)) return "ArrowRight";
  if (isUp(command)) return "ArrowUp";
  if (isDown(command)) return "ArrowDown";
  if (isA(command)) return "X";
  if (isB(command)) return "Z";
  if (isSelect(command)) return "Shift";
  if (isStart(command)) return "Enter";
  throw Error("illegal command");
}

export function toCommandInput(input: string): CommandInput | undefined {
  const split = input.split(/([0-9]+)/);
  let quantity = 1;
  let command: string;
  if (split.length > 1) {
    quantity = Number.parseInt(split[1]);
    command = split[2];
  } else {
    command = split[0];
  }
  if (isNaN(quantity)) {
    return undefined;
  }
  if (isCommand(command)) {
    return {
      command: command,
      quantity: quantity,
    };
  }
  return undefined;
}

export function toChord(input: string): Chord | undefined {
  const commands = input.split(" ").map(toCommandInput);
  if (commands.filter((command) => command === undefined).length) {
    return undefined;
  } else {
    return commands as Chord;
  }
}

export function commandToKeyInput(command: CommandInput): KeyInput[] {
  const keys: KeyInput[] = [];
  for (let i = 0; i < command.quantity; i++) {
    keys.push(toKeyInput(command.command));
  }
  return keys;
}

export function rawInputToKeyInput(input: string): KeyInput[] | undefined {
  return toChord(input)?.flatMap(commandToKeyInput);
}
