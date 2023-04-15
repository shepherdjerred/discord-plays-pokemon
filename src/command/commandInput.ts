import { Command, isCommand } from "./command.js";

export interface CommandInput {
  command: Command;
  quantity: number;
}

export function parseCommandInput(input: string): CommandInput | undefined {
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
      command: command.toLowerCase(),
      quantity: quantity,
    };
  }
  return undefined;
}
