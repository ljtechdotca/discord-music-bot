import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import ytdl from "ytdl-core";
import createLength from "./create-length";

const tracksPath = resolve(".", "data", "tracks.json");

const createTrack = {
  url: async (url: string) => {
    try {
      /**
       * Validate URL.
       * Fetch URL info.
       * Validate Country.
       */
      const isValidUrl = ytdl.validateURL(url);
      if (!isValidUrl) throw new Error("Invalid URL.");
      const {
        videoDetails: {
          availableCountries,
          title,
          lengthSeconds,
          videoId,
          video_url,
        },
      } = await ytdl.getInfo(url);
      const isValidCountry = availableCountries.includes("CA");
      if (!isValidCountry) throw new Error("Video not available in Canada.");

      /**
       * Read tracks JSON.
       * Define track data.
       * Initialize track.
       * Write tracks JSON.
       */
      let tracksData = JSON.parse(
        readFileSync(tracksPath, { encoding: "utf-8" })
      );

      let trackData = tracksData[videoId];

      if (tracksData[videoId]) {
        tracksData[videoId].requests++;
      } else {
        trackData = {
          duration: createLength(lengthSeconds),
          title,
          videoId,
          video_url,
          requests: 1,
        };
        tracksData = {
          ...tracksData,
          [videoId]: trackData,
        };
      }
      writeFileSync(tracksPath, JSON.stringify(tracksData));
      return trackData;
    } catch (error) {
      console.error(error);
    }
  },
  title: async (title: string) => {
    try {
      const track = `<${title}> SEARCH QUERY NOT YET IMPLEMENTED`;
      return track;
    } catch (error) {
      console.error(error);
    }
  },
};

export default createTrack;
