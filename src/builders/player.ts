/* eslint-disable no-unused-vars */
const {
  createAudioPlayer,
  joinVoiceChannel,
  AudioPlayerStatus,
  createAudioResource,
} = require("@discordjs/voice");
import {
  AudioPlayer,
  AudioPlayerBufferingState,
  AudioPlayerIdleState,
  AudioPlayerPausedState,
  AudioPlayerPlayingState,
  PlayerSubscription,
  VoiceConnection,
} from "@discordjs/voice";
import { Guild, MessageEmbed } from "discord.js";
import ytdl from "ytdl-core-discord";
import createTrack from "../helpers/create-track";

interface Track {
  title: string;
  video_url: string;
  duration: string;
}

class Player {
  audioPlayer: AudioPlayer;
  channelId?: string;
  currentTrack?: Track;
  embeds: MessageEmbed[] = [];
  guild?: Guild;
  queue: Track[] = [];
  subscription?: PlayerSubscription;
  voiceConnection?: VoiceConnection;

  constructor() {
    this.audioPlayer = createAudioPlayer();

    this.audioPlayer.on(
      AudioPlayerStatus.AutoPaused,
      (event: AudioPlayerPausedState) => {
        console.log("AutoPaused", event);
        if (this.currentTrack && this.channelId && this.guild) {
          this.connect(this.channelId, this.guild);
        }
      }
    );
    this.audioPlayer.on(
      AudioPlayerStatus.Buffering,
      (event: AudioPlayerBufferingState) => {
        console.log("Buffering", event);
      }
    );
    this.audioPlayer.on(
      AudioPlayerStatus.Idle,
      (event: AudioPlayerIdleState) => {
        console.log("Idle", event);
      }
    );
    this.audioPlayer.on(
      AudioPlayerStatus.Paused,
      (event: AudioPlayerPausedState) => {
        console.log("Paused", event);
      }
    );
    this.audioPlayer.on(
      AudioPlayerStatus.Playing,
      (event: AudioPlayerPlayingState) => {
        console.log("Playing", event);
      }
    );
    this.audioPlayer.on("error", (event) => {
      console.log("Error", event);
      this.start();
    });
  }

  connect(channelId: string, guild: Guild) {
    this.guild = guild;
    this.channelId = channelId;

    const newVoiceConnection = joinVoiceChannel({
      channelId: channelId,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    this.voiceConnection = newVoiceConnection;
    this.subscription = newVoiceConnection.subscribe(this.audioPlayer);
  }

  skip() {
    if (this.queue.length) {
      this.currentTrack = this.queue.shift();
      this.start();
    }
  }

  async start() {
    if (!this.currentTrack && this.queue.length) {
      const newTrack = this.queue.shift() as Track;

      this.currentTrack = newTrack;

      try {
        const stream = await ytdl(newTrack.video_url, {
          filter: "audioonly",
        });
        this.audioPlayer.play(createAudioResource(stream));
      } catch (error) {
        console.error(error);
      }
    }
  }

  async play(channelId: string, guild: Guild, url: string) {
    if (!this.voiceConnection) {
      this.connect(channelId, guild);
    }

    try {
      const newTrack = await createTrack.url(url);
      this.queue.push(newTrack);
      this.start();
      return newTrack;
    } catch (error) {
      console.error(error);
    }
  }

  pause() {
    try {
      this.audioPlayer.stop();
    } catch (error) {
      console.error(error);
    }
  }
}

export default Player;
