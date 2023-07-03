import { Events } from "discord.js";
import "./rest.js";
import client from "../client.js";
// import { makeScreenshot } from "./commands/screenshot.js";
import { WebDriver } from "selenium-webdriver";
import { help } from "./commands/help.js";

export function handleCommands(_driver: WebDriver) {
  console.log("handling slash commands");
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    switch (interaction.commandName) {
      case "start":
        break;
      case "screenshot":
        // await makeScreenshot(driver)(interaction);
        break;
      case "help":
        await help(interaction);
    }
  });
}
