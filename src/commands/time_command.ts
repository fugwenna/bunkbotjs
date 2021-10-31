import { SlashCommandBuilder } from "@discordjs/builders";

import { logErrorAsync } from "../channel";
import { getServerById } from "../core";

/**
 * @description
 * Print the time. for mkr
 */
const timeAsync = async(interaction: any): Promise<void> => {
    try {
        let time = new Date().toLocaleTimeString();

        if (interaction.member?.displayName == "mkr")
            time += ", you idiot";

        await interaction.reply(time);
    } catch (e) {
        await logErrorAsync(getServerById(interaction.guildId), e);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("time")
        .setDescription("Print the time"),

    async execute(interaction: any) {
        await timeAsync(interaction);
    }
}