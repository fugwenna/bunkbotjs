import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

import { logServerErrorAsync } from "../core";

/**
 * @description
 * Print the time. for mkr
 */
const timeAsync = async(interaction: CommandInteraction): Promise<void> => {
    try {
        let time = new Date().toLocaleTimeString();

        if (interaction.member?.user?.username == "mkr")
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

    async execute(interaction: CommandInteraction) {
        await timeAsync(interaction);
    }
}