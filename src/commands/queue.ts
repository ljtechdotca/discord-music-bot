import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction } from "discord.js";
import Player from "../builders/player";
import createEmbed from "../helpers/create-embed";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("queue")
    .setDescription("Returns the current setlist."),
  execute: async function (
    commands: Collection<string, any>,
    event: CommandInteraction,
    player: Player
  ) {
    let content = "The current setlist:";

    if (player.currentTrack) {
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
        `${event.user.username} used /queue`
      );

      event.reply({
        embeds: [embed],
      });
    }
  },
};
