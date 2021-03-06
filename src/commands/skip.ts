import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("skip")
    .setDescription("Skips the current track."),
  execute: async function ({ interaction, subscription }: CommandOptions) {
    if (subscription) {
      subscription.audioPlayer.stop();
      await interaction.reply("Skipped song!");
    } else {
      await interaction.reply("Not playing in this server!");
    }
  },
};
