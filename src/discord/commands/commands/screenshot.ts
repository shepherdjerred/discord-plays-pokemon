import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder, EmbedBuilder } from "discord.js";
import { WebDriver } from "selenium-webdriver";
import { Buffer } from "buffer";

export const screenshotCommand = new SlashCommandBuilder()
  .setName("screenshot")
  .setDescription("Take a screenshot and upload it to the chat");

export function makeScreenshot(driver: WebDriver) {
  return async function screenshot(interaction: CommandInteraction) {
    const screenshot = await driver.takeScreenshot();
    const buffer = Buffer.from(screenshot, "base64");
    const attachment = new AttachmentBuilder(buffer, {
      name: "screenshot.png",
      description: `Screenshot of the Pokémon game at ${Date()}`,
    });
    const embed = new EmbedBuilder().setTitle("Pokémon Screenshot").setImage("attachment://screenshot.png");
    await interaction.reply({ embeds: [embed], files: [attachment] });
  };
}
