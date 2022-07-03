import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("bangers")
    .setDescription("Returns a list of the top 10 most requested tracks."),
  execute: async function ({ commands, interaction }: CommandOptions) {
    interaction.deferReply();

    await interaction.editReply("Hello world!");
  },
};
