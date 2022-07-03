import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("random")
    .setDescription("Plays a random track."),
  execute: async function ({ commands, interaction }: CommandOptions) {
    interaction.deferReply();

    await interaction.editReply("Hello world!");
  },
};
