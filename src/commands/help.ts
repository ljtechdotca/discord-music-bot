import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

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
        .setRequired(true)
    ),
  execute: async function ({ commands, interaction }: CommandOptions) {
    let commandName = interaction.options.getString("command-name");

    if (commandName && commands.get(commandName)) {
      interaction.reply(commands.get(commandName).data.description);
    } else {
      const items: any[] = [];

      commands.forEach(({ data: { name, description } }) => {
        items.push(`- \`${name}\` : ${description}`);
      });

      interaction.reply(items.join("\n"));
    }
  },
};
