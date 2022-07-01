import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction } from "discord.js";
import Player from "../builders/player";
import createEmbed from "../helpers/create-embed";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("skip")
    .setDescription("Skips the current track."),
  execute: async function (
    commands: Collection<string, any>,
    event: CommandInteraction,
    player: Player
  ) {
    if (player.currentTrack) {
      let content = `${player.currentTrack.title} was skipped.`;

      player.skip();

      const embed = createEmbed(
        content,
        [
          {
            name: `Currently playing: ${player.currentTrack.title}`,
            value: player.currentTrack.duration,
          },
          ...player.queue.map(({ duration, title }, i) => ({
            name: `${i + 1}. ${title}`,
            value: duration,
          })),
        ],
        `${event.user.username} used /skip`
      );

      event.reply({
        embeds: [embed],
      });
    }
  },
};
