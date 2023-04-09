import { Page, KeyInput } from "puppeteer";
import configuration from "./configuration.js";
import { Client } from "discord.js";

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

const command = [
  ...left,
  ...right,
  ...up,
  ...down,
  ...a,
  ...b,
  ...select,
  ...start,
];
type Command = (typeof command)[number];
function isCommand(input: string): input is Command {
  return command.includes(input);
}

type Chord = CommandInput[];

interface CommandInput {
  command: Command;
  quantity: number;
}

const commandMap: { [key: Command]: KeyInput } = {
  Left: "ArrowLeft",
  Right: "ArrowRight",
  Up: "ArrowUp",
  Down: "ArrowDown",
  A: "A",
  B: "B",
  Select: "Shift",
  Start: "Enter",
};

function toKeyInput(command: Command): KeyInput {
  return commandMap[command];
}

function toCommandInput(input: String): CommandInput | Error {
  let splitInput = input.split(/[0-9]/);
  let quantity = 0;
  if (splitInput.length > 2) {
    return Error("unexpected format");
  } else if (input.length == 0) {
    return Error("no input");
  } else if (input.length == 2) {
    const [quantityString, _] = splitInput;
    quantity = Number(quantityString);
    [, ...splitInput] = splitInput;
  }
  if (isCommand(splitInput[0])) {
    return {
      command: splitInput[0],
      quantity,
    };
  }
  return Error("invalid command");
}

function toChord(input: String): Chord | Error {
  const commands = input.split(" ").map(toCommandInput);
  const errors: Error[] = commands.filter((command): command is Error => {
    return command instanceof Error;
  });
  if (errors.length > 0) {
    return Error(errors.toString());
  }
  return commands as Chord;
}

export async function handleCommands(page: Page) {
  const client = new Client({});

  console.log("logging in");
  await client.login(configuration.discordToken);

  client.on("message", async (interaction) => {
    if (interaction.author.id === configuration.self) {
      return;
    }
    const chord = toChord(interaction.content);
    console.log(chord);
    if (chord instanceof Error) {
      console.error(chord);
      interaction.reply(
        `Something went wrong when executing your commands: ${chord}`
      );
    } else {
      const maxCommands = 7;
      if (chord.length > 7) {
        interaction.reply(
          `You tried to executed ${chord.length} commands, but the max is ${maxCommands}`
        );
        return;
      }
      const maxQuantity = 4;
      const highQuantityCommands = chord.filter(
        (command) => command.quantity > maxQuantity
      );
      if (highQuantityCommands.length > 0) {
        interaction.reply(
          `You can't repeat a command more than ${maxQuantity} times. These commands are invalid: ${highQuantityCommands}`
        );
        return;
      }
      const maxTotal = 15;
      const total = chord
        .map((command) => command.quantity)
        .reduce((a, b) => a + b, 0);
      if (total > maxTotal) {
        interaction.reply(
          `You can't perform more than ${maxTotal} total actions in one message. You tried to execute ${total}}`
        );
        return;
      }
      console.log(`valid chord: ${chord}`);
      chord
        .flatMap((commandInput) => {
          let commands: string[] = [];
          return commands.fill(commandInput.command, 0, commandInput.quantity);
        })
        .forEach((command) => {
          page.keyboard.sendCharacter(command);
        });
      interaction.reply(`Executed ${JSON.stringify(chord)}`);
    }
  });
}
