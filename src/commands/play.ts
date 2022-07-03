import { SlashCommandBuilder } from "@discordjs/builders";
import {
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { GuildMember } from "discord.js";
import { CommandOptions } from "../helpers/discordClient";
import MusicSubscription from "../helpers/subscription";
import Track from "../helpers/track";

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultPermission(true)
    .setName("play")
    .setDescription("Queues up a new track.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The URL of the song to play.")
        .setRequired(true)
    ),
  execute: async function ({
    interaction,
    subscription,
    subscriptions,
  }: CommandOptions) {
    await interaction.deferReply();

    // @todo : currently removed the option to query via video title
    let url = interaction.options.getString("url") as string;

    if (!subscription) {
      if (
        interaction.member instanceof GuildMember &&
        interaction.member.voice.channel &&
        interaction.guildId
      ) {
        const channel = interaction.member.voice.channel;

        subscription = new MusicSubscription(
          joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
              .voiceAdapterCreator as DiscordGatewayAdapterCreator,
          })
        );

        subscription.voiceConnection.on("error", console.warn);

        subscriptions.set(interaction.guildId, subscription);
      }
    }

    if (!subscription) {
      await interaction.editReply(
        "Join a voice channel and then try that again!"
      );
      return;
    }

    try {
      await entersState(
        subscription.voiceConnection,
        VoiceConnectionStatus.Ready,
        20e3
      );
    } catch (error) {
      console.warn(error);
      await interaction.editReply(
        "Failed to join voice channel within 20 seconds, please try again later!"
      );
      return;
    }

    try {
      const track = await Track.from(url, {
        onStart() {
          interaction.editReply("Now playing!").catch(console.warn);
        },
        onFinish() {
          interaction.editReply("Now finished").catch(console.warn);
        },
        onError(error: Error) {
          console.warn(error);
          interaction.editReply(`Error: ${error.message}`).catch(console.warn);
        },
      });

      subscription.enqueue(track);

      await interaction.editReply(`Enqueued **${track.title}**`);
    } catch (error) {
      console.warn(error);
      await interaction.editReply(
        "Failed to play track, please try again later!"
      );
    }
  },
};
