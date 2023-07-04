import { CommandInteraction, SlashCommandBuilder, bold, channelMention, inlineCode, userMention } from "discord.js";
import { a, b, down, left, right, select, start, up } from "../../../command/command.js";
import { burst, hold, hold_b } from "../../../command/commandInput.js";
import { config } from "../../../config/index.js";

export const helpCommand = new SlashCommandBuilder().setName("help").setDescription("View Pokébot help");

export async function help(interaction: CommandInteraction) {
  const modifiers = [
    `Hold a button down: ${hold.join(", ")}`,
    `Burst/rapid-press a button: ${burst.join("\n")}`,
    `Hold the B button while pressing another button: ${hold_b.join("\n")}`,
  ];
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
      config.stream.userbot.id
    )} is online and streaming in the ${channelMention(config.stream.channel_id)} channel.`,
    `When the bot is online, you can send commands in the ${channelMention(config.game.commands.channel_id)} channel.`,
    `Notifications will be posted in ${channelMention(config.bot.notifications.channel_id)}.`,
    ``,
    `${bold("Commands")}`,
    `Commands are messages sent to the ${channelMention(
      config.game.commands.channel_id
    )}. The command format is ${inlineCode("[QUANTITY][MODIFIER][ACTION]")}. Quantity is a number from 0-${
      config.game.commands.max_quantity_per_action
    }. You can perform multiple commands in the same message by putting a space between each command; for example, sending the message ${inlineCode(
      "a b"
    )} will send both ${inlineCode("a")} and ${inlineCode("b")}. This is referred to as a chord.`,
    `Each chord can perform up to ${config.game.commands.chord.max_commands} commands.`,
    `You can perform a maximum of ${
      config.game.commands.chord.max_total
    } actions in a single message. For example, the message ${inlineCode("2a 2b")} results in a total of four actions.`,
    ``,
    `${bold("Modifiers")}`,
    `You can add modifiers to commands to change how the button presses occur.`,
    `The burst modifier will rapidly press a button ${config.game.commands.burst.quantity} times.`,
    `The hold modifier will hold a button for ${config.game.commands.hold.duration_in_milliseconds} milliseconds`,
    `Modifiers can be combined with the mechanisms described above.`,
    `For example ${inlineCode("2-a 2_b")} will cause A to be pressed ${
      config.game.commands.burst.quantity * 2
    } times and B to be held for ${config.game.commands.hold.duration_in_milliseconds * 2} milliseconds.`,
    ``,
    `${bold("Action List:")}`,
    `You can perform the listed action by providing any of the words listed. For example, to press Up you can send ${inlineCode(
      "up"
    )} or ${inlineCode("u")}.`,
    `All words are case insensitive.`,
    commandString,
    ``,
    `${bold("Modifier List:")}`,
    modifiersString,
    ``,
    `${bold("Extras:")}`,
    `The ${inlineCode("/screenshot")} command can be used to take a screenshot and upload it to the ${channelMention(
      config.bot.notifications.channel_id
    )} channel.`,
  ];
  await interaction.reply({
    content: lines.join("\n"),
    ephemeral: true,
  });
}
