import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import {
  Client,
  Collection,
  CommandInteraction,
  Guild,
  Intents,
  Interaction,
  Snowflake,
} from "discord.js";
import { readdirSync } from "fs";
import { resolve } from "path";
import color from "../lib/color";
import MusicSubscription from "./subscription";

export interface CommandOptions {
  commands: Collection<string, any>;
  interaction: CommandInteraction;
  subscription: MusicSubscription;
  subscriptions: Map<Snowflake, MusicSubscription>;
}

class DiscordClient {
  applicationId = "974072439212486666";
  body: string[] = [];
  client: Client;
  commands;
  intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES];
  server;
  subscriptions = new Map<Snowflake, MusicSubscription>();
  token;
  cmdsString = "";

  constructor(token: string) {
    this.client = new Client({
      intents: this.intents,
    });
    this.commands = new Collection<string, any>();
    this.token = token;
    this.server = new REST({ version: "9" }).setToken(this.token);
  }

  initCommands() {
    const filenames = readdirSync(resolve(".", "build", "commands"));
    const commands: any[] = [];

    for (let filename of filenames) {
      const command = require(`../commands/${filename}`);

      this.body.push(command.data.toJSON());
      commands.push({
        name: command.data.name,
        description: command.data.description,
        options: command.data.options,
        defaultPermission: command.data.defaultPermission,
      });
      this.commands.set(command.data.name, command);
    }

    this.cmdsString = JSON.stringify(commands);
  }

  /**
   * Creates events handlers ready and interactionCreate.
   *
   * The first handler is a one time listener that deploys commands to all guilds when the client is ready.
   *
   * The second hanlder listens for Discord slash command interactions and executes any valid commands.
   */
  initEvents() {
    this.client.once("ready", async () => {
      color("success", "Server", "Discord Client Ready!");

      this.client.guilds.cache.forEach(async (guild) => {
        this.putCommands(guild);
      });
    });

    this.client.on("interactionCreate", async (interaction: Interaction) => {
      if (!interaction.isCommand() || !interaction.guildId) return;

      const subscription = this.subscriptions.get(interaction.guildId);

      this.interact(interaction);

      await this.commands.get(interaction.commandName).execute({
        commands: this.commands,
        interaction,
        subscription,
        subscriptions: this.subscriptions,
      });
    });
  }

  /**
   * Handles the interaction object and logs a colorful response.
   */
  private interact(interaction: CommandInteraction) {
    const guild = interaction.guild!;

    let args;

    if (interaction.options.data.length) {
      args = interaction.options.data[0].value;
    }

    color("command", guild.name, "/" + interaction.commandName, args);
  }

  /**
   * Deploys our Discord slash commands to the targeted Discord guild.
   */
  async putCommands(guild: Guild) {
    try {
      this.server.put(
        Routes.applicationGuildCommands(this.applicationId, guild.id),
        {
          body: this.body,
        }
      );

      color("success", guild.name, "Discord Slash Commands Deployed!");
    } catch (error) {
      color("failed", guild.name, "Discord Slash Commands Failed Deploying!");

      console.error(error);
    }
  }

  async connect() {
    await this.client.login(this.token);
    this.initCommands();
    this.initEvents();
  }
}

export default DiscordClient;
