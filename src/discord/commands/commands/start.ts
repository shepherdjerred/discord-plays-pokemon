import { DescribeInstancesCommand, EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";
import { CommandInteraction, SlashCommandBuilder, channelMention } from "discord.js";
import configuration from "../../../configuration.js";

export const startCommand = new SlashCommandBuilder().setName("start").setDescription("Start the Pokébot");

export async function start(interaction: CommandInteraction) {
  const client = new EC2Client({});
  const describeCommand = new DescribeInstancesCommand({
    InstanceIds: [configuration.ec2InstanceId],
  });
  try {
    const result = await client.send(describeCommand);
    if (!result.Reservations) {
      await interaction.reply("instance not found");
      return;
    }
    const reservation = result.Reservations[0];
    if (!reservation.Instances) {
      await interaction.reply("instance not found");
      return;
    }
    const instance = reservation.Instances[0];
    if (instance.State?.Name === "running") {
      await interaction.reply("Pokébot is already running");
      return;
    }
    if (instance.State?.Name !== "stopped") {
      await interaction.reply("Pokébot is not ready to start");
      return;
    }
  } catch (error) {
    console.log(error);
    await interaction.reply("Something went wrong starting the Pokébot");
    return;
  }

  const startCommand = new StartInstancesCommand({
    InstanceIds: [configuration.ec2InstanceId],
  });
  try {
    await client.send(startCommand);
    await interaction.reply(
      `The Pokébot is starting. Join the channel ${channelMention(configuration.voiceChannelId)} to play!`
    );
  } catch (error) {
    console.log(error);
    await interaction.reply("Something went wrong starting the Pokébot");
  }
}
