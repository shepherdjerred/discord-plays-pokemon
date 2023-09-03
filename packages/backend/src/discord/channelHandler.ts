import { Events } from "discord.js";
import client from "./client.js";
import { config } from "../config/index.js";

export function handleChannelUpdate(updateFn: (participants: number) => Promise<void>) {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const newChannel = newState.channelId;
    const oldChannel = oldState.channelId;
    const channelId = config.stream.channel_id;

    if (newChannel === channelId || oldChannel === channelId) {
      const channel = await client.channels.fetch(channelId);
      if (channel?.isVoiceBased()) {
        await updateFn(channel.members.keys.length);
      }
    }
  });
}
