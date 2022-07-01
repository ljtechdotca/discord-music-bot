import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction } from "discord.js";
import Player from "../builders/player";
import createEmbed from "../helpers/create-embed";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("help")
    .setDescription(
      "For more information on a specific command, type /help command-name."
    )
    .addStringOption((option) =>
      option
        .setName("command-name")
        .setDescription("Display help information on this command.")
    ),
  execute: async function (
    commands: Collection<string, any>,
    event: CommandInteraction,
    player: Player
  ) {
    let commandName = event.options.getString("command-name");
    let content = this.data.description;

    if (commandName && commands.get(commandName)) {
      content = commands.get(commandName).data.description;
    }

    const embed = createEmbed(content, [], `${event.user.username} used /help`);

    event.reply({
      embeds: [embed],
    });
  },
};
