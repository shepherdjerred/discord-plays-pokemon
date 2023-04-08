import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export default {
  discordToken: env.get("DISCORD_TOKEN").required().asString(),
  serverId: env.get("SERVER_ID").required().asString(),
  textChannelId: env.get("TEXT_CHANNEL_ID").required().asString(),
  voiceChannelId: env.get("VOICE_CHANNEL_ID").required().asString(),
  username: env.get("USERNAME").required().asString(),
  password: env.get("PASSWORD").required().asString(),
};
