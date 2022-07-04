import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { TrackJson } from "../helpers/discordClient";

const filePath = resolve(".", "data", "tracks.json");

const handleTracks = {
  read: () => {
    const fileExists = existsSync(filePath);

    let tracks: Record<string, TrackJson> = {};

    if (fileExists) {
      const tracksString = readFileSync(filePath, "utf-8");

      tracks = JSON.parse(tracksString);
    } else {
      writeFileSync(filePath, "{}");

      tracks = {};
    }

    return tracks;
  },
  write: (tracks: Record<string, TrackJson>) => {
    const tracksString = JSON.stringify(tracks);

    writeFileSync(filePath, tracksString);
  },
};

export default handleTracks;
