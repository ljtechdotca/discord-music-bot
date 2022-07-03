import { config } from "dotenv";
import DiscordClient from "./helpers/discordClient";

config();

const token = process.env.TOKEN!;

async function main() {
  const discordClient = new DiscordClient(token);

  await discordClient.connect();
}

main();
