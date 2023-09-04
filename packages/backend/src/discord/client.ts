import { Client, GatewayIntentBits } from "discord.js";
import { config } from "../config/index.js";
import { logger } from "../logger.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages],
});

if (config.bot.enabled) {
  logger.info("discord bot is logging in");
  await client.login(config.bot.discord_token);
  logger.info("discord bot is logged in");
} else {
  logger.info("discord bot is disabled");
}

export default client;
