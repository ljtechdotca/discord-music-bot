import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";
import handleTracks from "../lib/handle-tracks";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("bangers")
    .setDescription("Returns a list of the top 10 most requested tracks."),
  execute: async function ({ commands, interaction }: CommandOptions) {
    await interaction.deferReply();

    const tracks = handleTracks.read();

    const list = Object.values(tracks)
      .sort((a: any, b: any) => b.requests - a.requests)
      .slice(0, 10)
      .map((song: any, i) => `${i + 1}. **${song.title}** x${song.requests}`);

    await interaction.editReply(list.join("\n"));
  },
};
