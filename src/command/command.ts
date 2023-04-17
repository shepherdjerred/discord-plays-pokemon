const left = ["left", "l"];
type Left = (typeof left)[number];
export function isLeft(input: string): input is Left {
  return left.includes(input);
}

const right = ["right", "r"];
type Right = (typeof right)[number];
export function isRight(input: string): input is Right {
  return right.includes(input);
}

const up = ["up", "u"];
type Up = (typeof up)[number];
export function isUp(input: string): input is Up {
  return up.includes(input);
}

const down = ["down", "d"];
type Down = (typeof down)[number];
export function isDown(input: string): input is Down {
  return down.includes(input);
}

const a = ["a"];
type A = (typeof a)[number];
export function isA(input: string): input is A {
  return a.includes(input);
}

const b = ["b"];
type B = (typeof b)[number];
export function isB(input: string): input is B {
  return b.includes(input);
}

const select = ["select", "se"];
type Select = (typeof select)[number];
export function isSelect(input: string): input is Select {
  return select.includes(input);
}

const start = ["start", "st"];
type Start = (typeof start)[number];
export function isStart(input: string): input is Start {
  return start.includes(input);
}

const command = [...left, ...right, ...up, ...down, ...a, ...b, ...select, ...start];
export type Command = (typeof command)[number];
export function isCommand(input: string): input is Command {
  return command.includes(input.toLowerCase());
}
