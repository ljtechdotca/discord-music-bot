import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import { MessageEmbed } from "discord.js";
import { raw } from "youtube-dl-exec";
import { getInfo } from "ytdl-core-discord";

const noop = () => {};

interface TrackData {
  id: string;
  author: string;
  url: string;
  title: string;
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}

class Track implements TrackData {
  embed: MessageEmbed;
  id: string;
  author: string;
  url: string;
  title: string;
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;

  constructor({
    id,
    author,
    url,
    title,
    onStart,
    onFinish,
    onError,
  }: TrackData) {
    this.embed = new MessageEmbed();
    this.id = id;
    this.author = author;
    this.url = url;
    this.title = title;
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  createAudioResource(): Promise<AudioResource<Track>> {
    return new Promise((resolve, reject) => {
      const process = raw(
        this.url,
        {
          o: "-",
          q: "",
          f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
          r: "100K",
        },
        { stdio: ["ignore", "pipe", "ignore"] }
      );

      if (!process.stdout) {
        reject(new Error("No stdout"));
        return;
      }

      const stream = process.stdout;

      const onError = (error: Error) => {
        if (!process.killed) process.kill();

        stream.resume();

        reject(error);
      };

      process
        .once("spawn", () => {
          demuxProbe(stream)
            .then((probe: { stream: any; type: any }) =>
              resolve(
                createAudioResource(probe.stream, {
                  metadata: this,
                  inputType: probe.type,
                })
              )
            )
            .catch(onError);
        })
        .catch(onError);
    });
  }

  public static async from(
    url: string,
    methods: Pick<Track, "onStart" | "onFinish" | "onError">
  ): Promise<Track> {
    const info = await getInfo(url);

    const {
      videoDetails: {
        author: { name },
        title,
        videoId,
        thumbnails,
      },
    } = info;

    const wrappedMethods = {
      onStart() {
        wrappedMethods.onStart = noop;
        methods.onStart();
      },
      onFinish() {
        wrappedMethods.onFinish = noop;
        methods.onFinish();
      },
      onError(error: Error) {
        wrappedMethods.onError = noop;
        methods.onError(error);
      },
    };

    const track = new Track({
      id: videoId,
      author: name,
      title: title,
      url,
      ...wrappedMethods,
    });

    track.embed = new MessageEmbed()
      .setColor(0x0099ff)
      .setTitle(title)
      .setURL(url)
      .setDescription(name)
      .setThumbnail(thumbnails[0].url)
      .setTimestamp();

    return track;
  }
}

export default Track;
