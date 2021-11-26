import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

import { addRoleToMemberAsync, getServerRolesAsync } from "../core";

enum ColorSubCommand {
    Set = "set",
    Clear = "clear",
    List = "list"
}

/**
 * @description
 * Manage a color role for all members, giving the ability
 * to list hex values
 */
const colorAsync = async(interaction: CommandInteraction): Promise<void> => {
    const subc = interaction.options.getSubcommand();

    switch (subc) {
        case ColorSubCommand.Set:
            await setMemberColorRoleAsync(interaction);
            break;

        case ColorSubCommand.Clear:
            break;

        case ColorSubCommand.List:
            break;
    }
}

/**
 * Set a color role for a given member. If the user has a color already, remove the
 * color role from the user and check if it can be removed from the server entirely
 * 
 * @param {Interaction} interaction - interaction which triggered the command
 * @param {string} color - color the user has entered
 */
const setMemberColorRoleAsync = async(interaction: CommandInteraction): Promise<void> => {
    const value = `color-${interaction.options.getString("value")}`;
    const colorRoles = await getServerRolesAsync(interaction.guildId);
    const existingRole = colorRoles.find(r => r.name == value);

    if (existingRole) {
        await addRoleToMemberAsync(interaction.guildId, interaction.member.user.id, existingRole);
        await interaction.reply(`Color role has been set to ${existingRole.name}`);
    } else {
        // todo
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Manage the color of your user in the server")
        .addSubcommand(x => x
			.setName(ColorSubCommand.Set)
			.setDescription("Set your personal color")
            .addStringOption(s => s
                .setName("value")
                .setDescription("Color value (hex# or 'blue', 'green', etc)")
                .setRequired(true)))
        .addSubcommand(x => x
			.setName(ColorSubCommand.Clear)
			.setDescription("Clear your personal color")),

    async execute(interaction: any) {
        await colorAsync(interaction);
    }
}