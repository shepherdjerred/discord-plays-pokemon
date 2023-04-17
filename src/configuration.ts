import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export default {
  botDiscordToken: env.get("BOT_DISCORD_TOKEN").required().asString(),
  serverId: env.get("SERVER_ID").required().asString(),
  textChannelId: env.get("TEXT_CHANNEL_ID").required().asString(),
  voiceChannelId: env.get("VOICE_CHANNEL_ID").required().asString(),
  username: env.get("USER_USERNAME").required().asString(),
  password: env.get("USER_PASSWORD").required().asString(),
  chordMaxCommands: env.get("CHORD_MAX_COMMANDS").required().asInt(),
  commandMaxQuantity: env.get("COMMAND_MAX_QUANTITY").required().asInt(),
  chordMaxTotal: env.get("CHORD_MAX_TOTAL").required().asInt(),
  keyPressDuration: env.get("KEY_PRESS_DURATION").required().asInt(),
  commandQuantityInterval: env.get("COMMAND_QUANTITY_INTERVAL").required().asInt(),
  width: env.get("WIDTH").required().asInt(),
  height: env.get("HEIGHT").required().asInt(),
  userDataPath: env.get("USER_DATA_PATH").required().asString(),
  applicationId: env.get("APPLICATION_ID").required().asString(),
};
