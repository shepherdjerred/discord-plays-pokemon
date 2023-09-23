import { REST, Routes } from "discord.js";
import { screenshotCommand } from "./commands/screenshot.js";
import { helpCommand } from "./commands/help.js";
import { logger } from "../../../logger.js";

export async function registerSlashCommands({
  botToken,
  areScreenshotsEnabled,
}: {
  botToken: string;
  areScreenshotsEnabled: boolean;
}) {
  const rest = new REST({ version: "10" }).setToken(botToken);
  logger.info("registering commands");

  let commands = [helpCommand.toJSON()];

  if (areScreenshotsEnabled) {
    logger.info("screenshot command is enabled");
    commands = [...commands, screenshotCommand.toJSON()];
  }

  await rest.put(Routes.applicationCommands(botToken), { body: commands });
}
