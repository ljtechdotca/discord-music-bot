import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction } from "discord.js";
import Player from "../builders/player";
import createEmbed from "../helpers/create-embed";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("pause")
    .setDescription("Stops the current track."),
  execute: async function (
    commands: Collection<string, any>,
    event: CommandInteraction,
    player: Player
  ) {
    let content = "Stopping ljmusic.";

    const embed = createEmbed(
      content,
      [],
      `${event.user.username} used /pause`
    );

    event.reply({
      embeds: [embed],
    });
  },
};
