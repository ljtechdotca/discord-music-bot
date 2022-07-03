import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";
import createEmbed from "../_old/create-embed.old";

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
  execute: async function ({ commands, interaction }: CommandOptions) {
    let commandName = interaction.options.getString("command-name");
    let content = this.data.description;

    if (commandName && commands.get(commandName)) {
      content = commands.get(commandName).data.description;
    }

    const embed = createEmbed(
      content,
      [],
      `${interaction.user.username} used /help`
    );

    interaction.reply({
      embeds: [embed],
    });
  },
};
