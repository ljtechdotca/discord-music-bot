import { EmbedFieldData, MessageEmbed } from "discord.js";

const createEmbed = (
  description: string,
  fields: EmbedFieldData[],
  title: string
) => {
  let embed = new MessageEmbed()
    .setColor("#ffffff")
    .setDescription(description)
    .addFields(...fields)
    .setTitle(title)
    .setTimestamp();

  return embed;
};

export default createEmbed;
