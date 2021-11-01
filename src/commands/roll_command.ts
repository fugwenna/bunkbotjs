import { SlashCommandBuilder } from "@discordjs/builders";
import { Message, MessageEmbed } from "discord.js";

import { logServerErrorAsync } from "../core"
import { getRandomNumber } from "../tools";

/**
 * @description
 * Roll command registered as /roll [range]
 */
const rollAsync = async(interaction: Message): Promise<void> => {
    try {
        const min = (<any>interaction).options.getInteger("min") ?? 1;
        const max = (<any>interaction).options.getInteger("max") ?? 100;
        const result = getRandomNumber(min, max);
        const embed = new MessageEmbed()
            .setColor(interaction.member.displayColor)
            .setTitle(`Rolling (${min}-${max})`)
            .setDescription(`${interaction.member?.displayName} rolls: ${result}`);

        await interaction.reply({ embeds: [embed] });
    } catch (e) {
        await logServerErrorAsync(interaction.guildId, e);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Roll a random number between 1 and 100 (or supply a custom range)")
        .addIntegerOption(x => x
            .setName("min")
            .setDescription("Enter a minimum"))
        .addIntegerOption(x => x
            .setName("max")
            .setDescription("Enter a maximum")),

    async execute(interaction: Message) {
        await rollAsync(interaction);
    }
}