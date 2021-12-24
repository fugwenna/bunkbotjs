import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types";
import { CommandInteraction } from "discord.js";

/**
 * 
 * @param interaction 
 */
const copyMessageToChannelAsync = async(interaction: CommandInteraction): Promise<void> => {
    await interaction.reply("Test")
}

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Link to channel")
        .setType(ApplicationCommandType.Message),

    async execute(interaction: CommandInteraction) {
        await copyMessageToChannelAsync(interaction);
    }
}