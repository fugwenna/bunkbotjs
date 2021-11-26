import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";

import { logServerErrorAsync } from "../core"
import { getRandomNumber } from "../tools";

/**
 * @description
 * Roll command registered as /roll [range]
 */
const rollAsync = async(interaction: CommandInteraction): Promise<void> => {
    try {
        const min = interaction.options.getInteger("min");
        const max = interaction.options.getInteger("max");
        const result = getRandomNumber(min, max);
        const member = <any>interaction.member;

        const embed = new MessageEmbed()
            .setColor(member.displayColor)
            .setTitle(`Rolling (${min}-${max})`)
            .setDescription(`${member.displayName} rolls: ${result}`);

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

    async execute(interaction: CommandInteraction) {
        await rollAsync(interaction);
    }
}