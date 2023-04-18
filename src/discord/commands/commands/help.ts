import { CommandInteraction, SlashCommandBuilder, bold, channelMention, inlineCode, userMention } from "discord.js";
import configuration from "../../../configuration.js";
import { a, b, down, left, right, select, start, up } from "../../../command/command.js";
import { burst, hold, hold_b } from "../../../command/commandInput.js";

export const helpCommand = new SlashCommandBuilder().setName("help").setDescription("View Pokébot help");

export async function help(interaction: CommandInteraction) {
  const modifiers = [`Hold: ${hold.join(", ")}`, `Burst: ${burst.join("\n")}`, `Hold B: ${hold_b.join("\n")}`];
  const modifiersString = modifiers
    .map((modifier) => {
      return `* ${modifier}`;
    })
    .join("\n");
  const commands = [
    `Up: ${up.join(", ")}`,
    `Down: ${down.join(", ")}`,
    `Left: ${left.join(", ")}`,
    `Right: ${right.join(", ")}`,
    `A: ${a.join(", ")}`,
    `B: ${b.join(", ")}`,
    `Start: ${start.join(", ")}`,
    `Select: ${select.join(", ")}`,
  ];
  const commandString = commands
    .map((command) => {
      return `* ${command}`;
    })
    .join("\n");
  const lines = [
    `${bold("Pokébot Help")}`,
    `The Pokébot is available when ${userMention(
      configuration.streamerId
    )} is online and streaming in the ${channelMention(configuration.voiceChannelId)} channel.`,
    `When the bot is online, you can send commands in the ${channelMention(
      configuration.commandTextChannelId
    )} channel.`,
    `Notifications will be posted in ${channelMention(configuration.notificationsTextChannelId)}.`,
    ``,
    `${bold("Commands")}`,
    `Commands are messages sent to the ${channelMention(
      configuration.commandTextChannelId
    )}. The command format is ${inlineCode("[QUANTITY][MODIFIER][ACTION]")}. Quantity is a number from 0-${
      configuration.commandMaxQuantity
    }. You can perform multiple commands in the same message by putting a space between each command; for example, sending the message ${inlineCode(
      "a b"
    )} will send both ${inlineCode("a")} and ${inlineCode("b")}. This is referred to as a chord.`,
    `Each chord can perform up to ${configuration.chordMaxCommands} commands.`,
    `You can perform a maximum of ${
      configuration.chordMaxTotal
    } actions in a single message. For example, the message ${inlineCode("2a 2b")} results in a total of four actions.`,
    `${bold("Modifiers")}`,
    `You can add modifiers to commands to change how the button presses occur.`,
    `The burst modifier will rapidly press a button ${configuration.burstPressQuantity} times.`,
    `The hold modifier will hold a button for ${configuration.holdDuration} milliseconds`,
    `Modifiers can be combined with the mechanisms described above.`,
    `For example ${inlineCode("2-a 2_b")} will cause A to be pressed ${
      configuration.burstPressQuantity * 2
    } times and B to be held for ${configuration.holdDuration * 2} milliseconds.`,
    `${bold("Action List:")}`,
    commandString,
    ``,
    `${bold("Modifier List:")}`,
    modifiersString,
    ``,
    `${bold("Extras:")}`,
    `The ${inlineCode("/screenshot")} command can be used to take a screenshot and upload it to the ${channelMention(
      configuration.notificationsTextChannelId
    )} channel.`,
  ];
  await interaction.reply({
    content: lines.join("\n"),
    ephemeral: true,
  });
}
