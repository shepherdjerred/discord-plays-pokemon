import {
  SlashCommandBuilder,
  CommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  TextChannel,
  channelMention,
  userMention,
  time,
} from "discord.js";
import { WebDriver } from "selenium-webdriver";
import { Buffer } from "buffer";
import configuration from "../../../configuration.js";
import client from "../../client.js";

export const screenshotCommand = new SlashCommandBuilder()
  .setName("screenshot")
  .setDescription("Take a screenshot and upload it to the chat");

export function makeScreenshot(driver: WebDriver) {
  return async function screenshot(interaction: CommandInteraction) {
    const screenshot = await driver.takeScreenshot();
    const buffer = Buffer.from(screenshot, "base64");
    const date = new Date();
    const attachment = new AttachmentBuilder(buffer, {
      name: "screenshot.png",
      description: `Screenshot of the Pokémon game at ${date.toISOString()}`,
    });
    const embed = new EmbedBuilder().setTitle("Pokémon Screenshot").setImage("attachment://screenshot.png");
    await interaction.reply({
      content: `Screenshot sent to ${channelMention(configuration.notificationsTextChannelId)}`,
      ephemeral: true,
    });

    const channel = client.channels.cache.get(configuration.notificationsTextChannelId);
    if (channel) {
      await (channel as TextChannel).send({
        content: `Screenshot taken by ${userMention(interaction.user.id)} at ${time(date)}`,
        embeds: [embed],
        files: [attachment],
      });
    } else {
      await interaction.reply({ ephemeral: true, content: "There was an error" });
    }
  };
}
