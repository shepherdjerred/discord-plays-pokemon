import { Client, GatewayIntentBits } from "discord.js";
import { config } from "../config/index.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

await client.login(config.bot.discord_token);

export default client;
