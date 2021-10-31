import { SlashCommandBuilder } from "@discordjs/builders";

import { logServerErrorAsync } from "../channel";

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
        await logServerErrorAsync(interaction.guildId, e);
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