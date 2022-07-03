import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("leave")
    .setDescription("Leave the voice channel."),
  execute: async function ({
    interaction,
    subscription,
    subscriptions,
  }: CommandOptions) {
    if (subscription && interaction.guildId) {
      subscription.voiceConnection.destroy();
      subscriptions.delete(interaction.guildId);
      await interaction.reply({ content: "Left channel!", ephemeral: true });
    } else {
      await interaction.reply("Not playing in this server!");
    }
  },
};
