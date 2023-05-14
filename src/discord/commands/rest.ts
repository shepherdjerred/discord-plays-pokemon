import { REST, Routes } from "discord.js";
import configuration from "../../configuration.js";
import { screenshotCommand } from "./commands/screenshot.js";
import { startCommand } from "./commands/start.js";
import { helpCommand } from "./commands/help.js";

// the commands API is rate limited.
// we only need to update commands when the interfaces have changed.
const updateCommands = false;

const rest = new REST({ version: "10" }).setToken(configuration.helperDiscordToken);

await (async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (updateCommands) {
      const commands = [screenshotCommand.toJSON(), startCommand.toJSON(), helpCommand.toJSON()];
      console.log(commands);
      const data = await rest.put(Routes.applicationCommands(configuration.applicationId), { body: commands });
      console.log(data);
    }
  } catch (error) {
    console.error(error);
  }
})();
