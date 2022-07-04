import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandOptions } from "../helpers/discordClient";
import handleTracks from "../lib/handle-tracks";
import randomNumber from "../lib/random-number";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("random")
    .setDescription("Plays a random track."),
  execute: async function ({
    commands,
    interaction,
    subscription,
    subscriptions,
  }: CommandOptions) {
    // await interaction.deferReply();

    const tracks = handleTracks.read();

    const tracksArray = Object.values(tracks);

    const randomIndex = randomNumber(tracksArray.length);

    const { url } = tracksArray[randomIndex];

    await commands.get("play").execute({
      commands,
      interaction,
      subscription,
      subscriptions,
      url,
    });
  },
};
