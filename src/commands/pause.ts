import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("pause")
    .setDescription("Stops the current track."),
  execute: async function ({ interaction, subscription }: CommandOptions) {
    if (subscription) {
      subscription.audioPlayer.pause();
      await interaction.reply({ content: "Paused!", ephemeral: true });
    } else {
      await interaction.reply("Not playign in this server!");
    }
  },
};
