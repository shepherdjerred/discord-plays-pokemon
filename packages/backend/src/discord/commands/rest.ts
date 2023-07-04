import { REST, Routes } from "discord.js";
import { screenshotCommand } from "./commands/screenshot.js";
import { helpCommand } from "./commands/help.js";
import { config } from "../../config/index.js";

// the commands API is rate limited.
// we only need to update commands when the interfaces have changed.
const updateCommands = false;

const rest = new REST({ version: "10" }).setToken(config.bot.discord_token);

await (async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (updateCommands) {
      const commands = [screenshotCommand.toJSON(), helpCommand.toJSON()];
      console.log(commands);
      const data = await rest.put(Routes.applicationCommands(config.bot.application_id), { body: commands });
      console.log(data);
    }
  } catch (error) {
    console.error(error);
  }
})();
