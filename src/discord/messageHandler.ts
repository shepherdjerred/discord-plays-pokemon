import configuration from "../configuration.js";
import { Events, Message } from "discord.js";
import { parseChord, type Chord } from "../command/chord.js";
import client from "./client.js";
import { execute } from "./chordExecutor.js";
import { isValid } from "./chordValidator.js";
import { KeyInput } from "../command/keybinds.js";

export function handleMessages(fn: (key: KeyInput) => Promise<void>) {
  console.log("ready to handle commands");
  client.on(Events.MessageCreate, async (event) => {
    try {
      return handleMessage(event, fn);
    } catch (error) {
      console.log(error);
    }
  });
}

async function handleMessage(event: Message, fn: (key: KeyInput) => Promise<void>) {
  // ignore bots
  if (event.author.bot) {
    return;
  }

  // only handle commands in our text chat channel
  if (event.channelId !== configuration.textChannelId) {
    return;
  }

  let chord: Chord | undefined;
  try {
    chord = parseChord(event.content);
  } catch {
    await event.react("💀");
    return;
  }

  if (!chord) {
    console.error(chord);
    await event.react("❓");
    return;
  }

  if (isValid(chord)) {
    await execute(chord, fn);
    await event.react(`👍`);
  } else {
    await event.react(`⛔`);
    return;
  }
}
