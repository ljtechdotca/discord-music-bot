import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Collection } from "discord.js";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";

config();

const applicationId = "974072439212486666";
const token = process.env.TOKEN as string;

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const initCommands = async (guildId: string) => {
  let commands = new Collection();
  let body: string[] = [];

  const filenames = readdirSync(resolve(".", "commands"));

  for (let filename of filenames) {
    const command = require(`../commands/${filename}`);
    body.push(command.data.toJSON());
    commands.set(command.data.name, command);
  }

  return new Promise((resolve) => {
    readline.question(
      "[💡] Question : Do you wish to deploy update (Y/N)? ",
      (event: string) => {
        if (event.toUpperCase() === "Y") {
          const rest = new REST({ version: "9" }).setToken(token);

          rest
            .put(Routes.applicationGuildCommands(applicationId, guildId), {
              body,
            })
            .then((res) => {
              console.log("PUT", { res });
              console.log("[✨] Success : Deploy Update");
            })
            .catch((error) => {
              console.log("[💥] Failed : Deploy Update");
              console.error(error);
            });
        } else {
          console.log("[🎈] Skip : Deploy Update");
        }
        readline.close();
      }
    );

    readline.on("close", () => {
      resolve(commands);
    });
  });
};

export default initCommands;
