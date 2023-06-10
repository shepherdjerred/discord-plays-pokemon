import { Events } from "discord.js";
import "./rest.js";
import client from "../client.js";
import { makeScreenshot } from "./commands/screenshot.js";
import { WebDriver } from "selenium-webdriver";
import { help } from "./commands/help.js";
import configuration from "../../configuration.js";

export function handleCommands(driver: WebDriver) {
  console.log("handling slash commands");
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    switch (interaction.commandName) {
      case "start":
        break;
      case "screenshot":
        await makeScreenshot(driver)(interaction);
        break;
      case "help":
        await help(interaction);
    }
  });
}

export async function sendStartupMessage() {
  const channel = client.channels.cache.get(configuration.notificationsTextChannelId);
  if (channel) {
    // TODO enable when this is less annoying
    // await (channel as TextChannel).send({
    //   content: `@here The Pokébot has started! Join ${channelMention(configuration.voiceChannelId)} to play along.`,
    // });
  } else {
    console.error("unable to find channel");
  }
}
