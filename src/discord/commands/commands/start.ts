import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const startCommand = new SlashCommandBuilder().setName("start").setDescription("Start the Pokébot");

export async function start(interaction: CommandInteraction) {
  await interaction.reply("not yet implemented");
}
