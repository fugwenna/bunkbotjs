import { SlashCommandBuilder } from "@discordjs/builders";
import { ColorResolvable, CommandInteraction, CreateRoleOptions, GuildMember, Role } from "discord.js";

import { addRoleToMemberAsync, createRoleAsync, getServerRolesAsync, removeRolesFromMemberAsync } from "../core";

enum ColorSubCommand {
    Set = "set",
    Clear = "clear",
    List = "list"
}

/**
 * Max amount of **unique** color roles per
 * server - max roles for discord is 250
 */
const MAX_COLOR_ROLE_COUNT: number = 50;

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
    const value = interaction.options.getString("value");
    const colorValue = `color-${value}`;
    const colorRoles = await getServerRolesAsync(interaction.guildId, "color-");
    let roleToAdd: CreateRoleOptions;

    if (colorRoles.values.length >= MAX_COLOR_ROLE_COUNT) {
        await interaction.reply("The max allowed color roles for this guild has been met!");
        // TODO ... list in a thing?
    } else {
        roleToAdd = colorRoles.find(r => r.name == colorValue);

        if (!roleToAdd) {
            let index: number = 1;

            if (colorRoles.values.length > 0)
                index = Math.min(...colorRoles.map(r => r.position));

            roleToAdd = await createRoleAsync(interaction.guildId, {
                name: colorValue,
                position: index,
                color: <ColorResolvable>value,
                hoist: true
            });
        }

        if (roleToAdd) {
            await removeRolesFromMemberAsync(<GuildMember>interaction.member, "color-");
            await addRoleToMemberAsync(interaction.guildId, interaction.member.user.id, <Role>roleToAdd);

            await interaction.reply(`${interaction.member.user.toString()}'s color role has been set to \`${roleToAdd.name}\`!`);
        }
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