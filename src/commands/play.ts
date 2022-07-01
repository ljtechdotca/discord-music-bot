import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction } from "discord.js";
import Player from "../builders/player";
import createEmbed from "../helpers/create-embed";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("play")
    .setDescription("Queues up a new track.")
    .addStringOption((option) =>
      option.setName("title").setDescription("Queue a YouTube video via title.")
    )
    .addStringOption((option) =>
      option.setName("url").setDescription("Queue a YouTube video via URL.")
    ),
  execute: async function (
    commands: Collection<string, any>,
    event: CommandInteraction,
    player: Player
  ) {
    try {
      // @todo : currently removed the option to query via video title
      // let title = event.options.getString("title");
      let url = event.options.getString("url") as string;
      let content = "Nothing was added.";
      const member = event.member;
      const guild = event.guild;
      const channelId = event.channelId;

      if (!guild || !guild.available)
        throw new Error("No guild is not available.");

      const track = await player.play(channelId, guild, url);

      content = `Adding "${track.title}" to Player Queue`;

      const embed = createEmbed(
        content,
        [
          { name: "Duration", value: track.duration, inline: true },
          { name: "Requested By", value: event.user.username, inline: true },
        ],
        `${event.user.username} used /play`
      );

      event.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
