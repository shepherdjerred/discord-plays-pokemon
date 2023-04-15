import { Client, GatewayIntentBits } from "discord.js";
import configuration from "../configuration.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

await client.login(configuration.botDiscordToken);

export default client;
