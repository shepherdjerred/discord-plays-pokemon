import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export default {
  helperDiscordToken: env.get("HELPER_DISCORD_TOKEN").required().asString(),
  serverId: env.get("SERVER_ID").required().asString(),
  commandTextChannelId: env.get("COMMAND_TEXT_CHANNEL_ID").required().asString(),
  notificationsTextChannelId: env.get("NOTIFICATIONS_TEXT_CHANNEL_ID").required().asString(),
  voiceChannelId: env.get("VOICE_CHANNEL_ID").required().asString(),
  streamerId: env.get("STREAMER_ID").required().asString(),
  streamerUsername: env.get("STREAMER_USERNAME").required().asString(),
  streamerPassword: env.get("STREAMER_PASSWORD").required().asString(),
  chordMaxCommands: env.get("CHORD_MAX_COMMANDS").required().asInt(),
  commandMaxQuantity: env.get("COMMAND_MAX_QUANTITY").required().asInt(),
  chordMaxTotal: env.get("CHORD_MAX_TOTAL").required().asInt(),
  keyPressDuration: env.get("KEY_PRESS_DURATION").required().asInt(),
  commandQuantityInterval: env.get("COMMAND_QUANTITY_INTERVAL").required().asInt(),
  applicationId: env.get("APPLICATION_ID").required().asString(),
  burstPressDuration: env.get("BURST_PRESS_DURATION").required().asInt(),
  burstPressDelay: env.get("BURST_PRESS_DELAY").required().asInt(),
  burstPressQuantity: env.get("BURST_PRESS_QUANTITY").required().asInt(),
  holdDuration: env.get("HOLD_DURATION").required().asInt(),
};
