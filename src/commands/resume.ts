import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("resume")
    .setDescription("Resumes the current track."),
  execute: async function ({ interaction, subscription }: CommandOptions) {
    if (subscription) {
      subscription.audioPlayer.unpause();
      await interaction.reply({ content: "Unpaused!", ephemeral: true });
    } else {
      await interaction.reply("Not playing in this server!");
    }
  },
};
