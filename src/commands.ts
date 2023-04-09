import { Page } from "puppeteer-core";
import configuration from "./configuration.js";
import { Client } from "discord.js";

export async function handleCommands(page: Page) {
  console.log("ready for commands");
  const client = new Client({});

  await client.login(configuration.discordToken);
  console.log("logged in");

  client.on("message", async (interaction) => {
    switch (interaction.content) {
      case "LEFT":
        await page.keyboard.press("ArrowLeft");
        await interaction.reply("Detected LEFT");
        break;
      case "RIGHT":
        await page.keyboard.press("ArrowRight");
        await interaction.reply("Detected RIGHT");
        break;
      case "UP":
        await page.keyboard.press("ArrowUp");
        await interaction.reply("Detected UP");
        break;
      case "DOWN":
        await page.keyboard.press("ArrowDown");
        await interaction.reply("Detected DOWN");
        break;
      case "A":
        await page.keyboard.press("A");
        await interaction.reply("Detected A");
        break;
      case "B":
        await page.keyboard.press("B");
        await interaction.reply("Detected B");
        break;
      case "SELECT":
        await page.keyboard.press("Shift");
        interaction.reply("Detected SELECT");
        break;
      case "START":
        await page.keyboard.press("Enter");
        await interaction.reply("Detected START");
        break;
    }
  });
}
