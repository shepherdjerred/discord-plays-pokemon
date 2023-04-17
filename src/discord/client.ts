import { AttachmentBuilder, Channel, Client, GatewayIntentBits, TextChannel } from "discord.js";
import configuration from "../configuration.js";
import { readFile, watch } from "fs/promises";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

await client.login(configuration.botDiscordToken);

export default client;

export async function watchForSaves() {
  const watcher = watch("/home/user/Downloads");
  for await (const event of watcher) {
    const channel = client.channels.cache.get(configuration.textChannelId);
    if (channel) {
      const contents = await readFile(event.filename);
      const attachment = new AttachmentBuilder(contents, {
        name: event.filename,
        description: `Save of the Pokémon game at ${Date()}`,
      });
      await (channel as TextChannel).send({ files: [attachment] });
    } else {
      console.error("unable to find channel");
    }
  }
}
