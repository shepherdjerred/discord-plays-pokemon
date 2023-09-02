import { REST, Routes } from "discord.js";
import { screenshotCommand } from "./commands/screenshot.js";
import { helpCommand } from "./commands/help.js";
import { config } from "../../config/index.js";

const rest = new REST({ version: "10" }).setToken(config.bot.discord_token);

export async function registerCommands() {
  try {
    let commands = [helpCommand.toJSON()];

    if (config.bot.commands.screenshot.enabled) {
      commands = [...commands, screenshotCommand.toJSON()];
    }

    console.log(commands);
    const data = await rest.put(Routes.applicationCommands(config.bot.application_id), { body: commands });
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
