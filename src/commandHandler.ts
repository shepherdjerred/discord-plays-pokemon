import { Page } from "puppeteer";
import configuration from "./configuration.js";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { toChord, toKeyInput } from "./commandParser.js";

export async function handleCommands(page: Page) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
  });

  console.log("logging in via api");
  await client.login(configuration.discordToken);

  client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
  });

  client.on(Events.MessageCreate, async (event) => {
    if (event.author.bot) {
      return;
    }
    if (event.channelId !== configuration.textChannelId) {
      return;
    }
    const chord = toChord(event.content);
    console.log(chord);
    if (!chord) {
      console.error(chord);
      await event.react("💀");
      return;
    } else {
      const maxCommands = 7;
      if (chord.length > 7) {
        console.error(`You tried to executed ${chord.length} commands, but the max is ${maxCommands}.`);
        await event.react(`⛔`);
        return;
      }
      const maxQuantity = 4;
      const highQuantityCommands = chord.filter((command) => command.quantity > maxQuantity);
      if (highQuantityCommands.length > 0) {
        console.error(
          `You can't repeat a command more than ${maxQuantity} times. These commands are invalid: ${JSON.stringify(
            highQuantityCommands
          )}.`
        );
        await event.react(`⛔`);
        return;
      }
      const maxTotal = 15;
      const total = chord.map((command) => command.quantity).reduce((a, b) => a + b, 0);
      if (total > maxTotal) {
        console.error(
          `You can't perform more than ${maxTotal} total actions in one message. You tried to execute ${total}.`
        );
        await event.react(`⛔`);
        return;
      }
      console.log(`valid chord: ${JSON.stringify(chord)}`);
      for (const commandInput of chord) {
        for (let i = 0; i < commandInput.quantity; i++) {
          const key = toKeyInput(commandInput.command);
          if (!key) {
            console.error(`unknown key ${JSON.stringify(commandInput)}`);
            await event.react(`💀`);
          } else {
            console.log(`sending ${JSON.stringify(key)}`);
            await page.keyboard.press(key, {
              delay: 50,
            });
          }
        }
      }
      await event.react(`👍`);
      console.log(`Executed ${JSON.stringify(chord)}`);
    }
  });
}
