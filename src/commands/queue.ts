import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { CommandOptions } from "../helpers/discordClient";
import Track from "../helpers/track";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("queue")
    .setDescription("Returns the current setlist."),
  execute: async function ({ interaction, subscription }: CommandOptions) {
    if (subscription) {
      const current =
        subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
          ? `Nothing is currently playing!`
          : `Playing **${
              (subscription.audioPlayer.state.resource as AudioResource<Track>)
                .metadata.title
            }**`;

      const queue = subscription.queue
        .slice(0, 5)
        .map((track, index) => `${index + 1} ${track.title}`)
        .join("\n");

      await interaction.reply(`${current}\n\n${queue}`);
    } else {
      await interaction.reply("Not playing in this server!");
    }
  },
};
