import { Events } from "discord.js";
import "./rest.js";
import client from "../client.js";
import { help } from "./commands/help.js";
import { logger } from "../../../logger.js";
import { Observable } from "rxjs";

export function handleSlashCommands() {
  return new Observable((subscriber) => {
    client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (!interaction.isChatInputCommand()) {
          return;
        }
        switch (interaction.commandName) {
          case "screenshot":
            subscriber.next("screenshot");
            break;
          case "help":
            await help(interaction);
        }
      } catch (e) {
        logger.error(e);
      }
    });
  });
}
