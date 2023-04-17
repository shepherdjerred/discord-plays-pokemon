import { Events } from "discord.js";
import "./rest.js";
import client from "../client.js";
import { makeScreenshot } from "./commands/screenshot.js";
import { start } from "./commands/start.js";
import { stop } from "./commands/stop.js";
import { WebDriver } from "selenium-webdriver";

export function handleCommands(driver: WebDriver) {
  console.log("handling slash commands");
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    switch (interaction.commandName) {
      case "start":
        await start(interaction);
        break;
      case "stop":
        await stop(interaction);
        break;
      case "screenshot":
        await makeScreenshot(driver)(interaction);
        break;
    }
  });
}
