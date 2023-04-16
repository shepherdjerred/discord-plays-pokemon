import { Page } from "puppeteer";
import configuration from "../configuration.js";
import { Events } from "discord.js";
import { parseChord, type Chord } from "../command/chord.js";
import client from "./client.js";
import { execute } from "./chordExecutor.js";
import { isValid } from "./chordValidator.js";

export function handleMessages(page: Page) {
  console.log("handling commands");
  client.on(Events.MessageCreate, async (event) => {
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

    if (isValid(chord, event.author.id)) {
      await execute(chord, page);
      await event.react(`👍`);
    } else {
      await event.react(`⛔`);
      return;
    }
  });
}
