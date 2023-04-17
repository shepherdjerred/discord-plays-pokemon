import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const stopCommand = new SlashCommandBuilder().setName("stop").setDescription("Stop the Pokébot");

export async function stop(interaction: CommandInteraction) {
  await interaction.reply("not yet implemented");
}
