import { Events, Message } from "discord.js";
import { parseChord, type Chord } from "../command/chord.js";
import client from "./client.js";
import { execute } from "./chordExecutor.js";
import { isValid } from "./chordValidator.js";
import { CommandInput } from "../command/commandInput.js";
import { config } from "../config/index.js";

export let lastCommand = new Date();

export function handleMessages(fn: (commandInput: CommandInput) => Promise<void>) {
  console.log("ready to handle commands");
  client.on(Events.MessageCreate, async (event) => {
    try {
      return handleMessage(event, fn);
    } catch (error) {
      console.log(error);
    }
  });
}

async function handleMessage(event: Message, fn: (commandInput: CommandInput) => Promise<void>) {
  if (event.author.bot) {
    return;
  }

  if (event.channelId !== config.game.commands.channel_id) {
    return;
  }

  const channel = client.channels.cache.get(config.stream.channel_id);
  if (!channel) {
    await event.react("💀");
    return;
  }

  // TODO: check that the sender is in the voice channel
  // if (event.member?.voice.channelId !== configuration.voiceChannelId) {
  //   await event.reply(`You have to be in ${channelMention(configuration.voiceChannelId)} to play`);
  //   return;
  // }

  // const memberCount = (channel as VoiceChannel).members.filter((member) => {
  //   return !member.user.bot;
  // }).size;
  // if (memberCount < configuration.minimumMembersInVoiceChannel) {
  //   await event.reply(
  //     `You can't play unless there are at least ${configuration.minimumMembersInVoiceChannel} ${
  //       configuration.minimumMembersInVoiceChannel === 1 ? "person" : "people"
  //     } in ${channelMention(configuration.voiceChannelId)} 😕`
  //   );
  //   return;
  // }

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
    lastCommand = new Date();
  } else {
    await event.react(`⛔`);
    return;
  }
}
