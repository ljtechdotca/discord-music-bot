import { CommandInteraction, Interaction } from "discord.js";

import { Client, Intents } from "discord.js";
import { config } from "dotenv";
import initCommands from "./helpers/init-commands";
import Player from "./builders/player";

config();

const guildId = "788753558321102849";

const main = async () => {
  let commands: any = await initCommands(guildId);

  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
  });

  const player = new Player();

  client.login(process.env.TOKEN);

  client.once("ready", () => {
    console.log("[✨] Success : Discord Client Ready");
  });

  client.on("interactionCreate", async (event: Interaction) => {
    if (!event.isCommand()) return;
    console.log(`[🌠] Command : !${event.commandName}`);
    await commands.get(event.commandName).execute(commands, event, player);
  });
};

main();
