import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { promisify } from "node:util";
import Track from "./track";

const wait = promisify(setTimeout);

class MusicSubscription {
  readonly voiceConnection: VoiceConnection;
  readonly audioPlayer: AudioPlayer;
  queue: Track[];
  queueLock = false;
  readyLock = false;

  constructor(voiceConnection: VoiceConnection) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];

    interface NewState {
      status: any;
      reason: any;
      closeCode: number;
    }

    this.voiceConnection.on(
      "stateChange",
      async (oldState: any, newState: any) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
          if (
            newState.reason ===
              VoiceConnectionDisconnectReason.WebSocketClose &&
            newState.closeCode === 4014
          ) {
            try {
              await entersState(
                this.voiceConnection,
                VoiceConnectionStatus.Connecting,
                5_000
              );
            } catch {
              this.voiceConnection.destroy();
            }
          } else if (this.voiceConnection.rejoinAttempts < 5) {
            await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
            this.voiceConnection.rejoin();
          } else {
            this.voiceConnection.destroy();
          }
        } else if (newState.status === VoiceConnectionStatus.Destroyed) {
          this.stop();
        } else if (
          !this.readyLock &&
          (newState.status === VoiceConnectionStatus.Connecting ||
            newState.status === VoiceConnectionStatus.Signalling)
        ) {
          this.readyLock = true;
          try {
            await entersState(
              this.voiceConnection,
              VoiceConnectionStatus.Ready,
              20_000
            );
          } catch {
            if (
              this.voiceConnection.state.status !==
              VoiceConnectionStatus.Destroyed
            )
              this.voiceConnection.destroy();
          } finally {
            this.readyLock = false;
          }
        }
      }
    );

    this.audioPlayer.on("stateChange", (oldState: any, newState: any) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        (oldState.resource as AudioResource<Track>).metadata.onFinish();
        void this.processQueue();
      } else if (newState.status === AudioPlayerStatus.Playing) {
        (newState.resource as AudioResource<Track>).metadata.onStart();
      }
    });

    voiceConnection.subscribe(this.audioPlayer);
  }

  enqueue(track: Track) {
    this.queue.push(track);
    void this.processQueue();
  }

  stop() {
    this.queueLock = true;
    this.queue = [];
    this.audioPlayer.stop(true);
  }

  private async processQueue(): Promise<void> {
    if (
      this.queueLock ||
      this.audioPlayer.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      return;
    }

    this.queueLock = true;

    const nextTrack = this.queue.shift()!;

    try {
      const resource = await nextTrack.createAudioResource();

      this.audioPlayer.play(resource);

      this.queueLock = false;
    } catch (error) {
      nextTrack.onError(error as Error);

      this.queueLock = false;

      return this.processQueue();
    }
  }
}

export default MusicSubscription;
