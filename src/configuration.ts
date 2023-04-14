import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export default {
  botId: env.get("BOT_ID").required().asString(),
  botDiscordToken: env.get("BOT_DISCORD_TOKEN").required().asString(),
  serverId: env.get("SERVER_ID").required().asString(),
  serverName: env.get("SERVER_NAME").required().asString(),
  textChannelId: env.get("TEXT_CHANNEL_ID").required().asString(),
  voiceChannelId: env.get("VOICE_CHANNEL_ID").required().asString(),
  username: env.get("USER_USERNAME").required().asString(),
  password: env.get("USER_PASSWORD").required().asString(),
};
