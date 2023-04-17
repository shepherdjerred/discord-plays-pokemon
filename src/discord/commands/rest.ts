import { REST, Routes } from "discord.js";
import configuration from "../../configuration.js";
import { screenshotCommand } from "./commands/screenshot.js";
import { startCommand } from "./commands/start.js";
import { stopCommand } from "./commands/stop.js";

// the commands API is rate limited.
// we only need to update commands when the interfaces have changed.
const updateCommands = false;

const rest = new REST({ version: "10" }).setToken(configuration.botDiscordToken);

await (async () => {
  try {
    if (updateCommands) {
      const commands = [screenshotCommand.toJSON(), startCommand.toJSON(), stopCommand.toJSON()];
      console.log(commands);
      const data = await rest.put(Routes.applicationCommands(configuration.applicationId), { body: commands });
      console.log(data);
    }
  } catch (error) {
    console.error(error);
  }
})();
