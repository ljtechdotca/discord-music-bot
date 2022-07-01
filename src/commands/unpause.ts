import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction } from "discord.js";
import Player from "../builders/player";
import createEmbed from "../helpers/create-embed";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("unpause")
    .setDescription("Resumes the current track."),
  execute: async function (
    commands: Collection<string, any>,
    event: CommandInteraction,
    player: Player
  ) {
    let content = "Resuming ljmusic.";

    const embed = createEmbed(
      content,
      [],
      `${event.user.username} used /unpause`
    );

    event.reply({
      embeds: [embed],
    });
  },
};
