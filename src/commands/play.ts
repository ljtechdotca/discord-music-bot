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
import { default as handleTracks } from "../lib/handle-tracks";

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
    url,
  }: CommandOptions) {
    await interaction.deferReply();

    let tracks = handleTracks.read();

    if (!url) {
      url = interaction.options.getString("url")!.split("?")[0];
    }

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

      if (tracks[track.id]) {
        tracks[track.id] = {
          ...tracks[track.id],
          requests: (tracks[track.id].requests += 1),
        };
      } else {
        tracks[track.id] = {
          title: track.title,
          url: track.url,
          requests: 1,
        };
      }

      subscription.enqueue(track);

      handleTracks.write(tracks);

      await interaction.editReply(`Enqueued **${track.title}**`);
    } catch (error) {
      console.warn(error);
      await interaction.editReply(
        "Failed to play track, please try again later!"
      );
    }
  },
};
