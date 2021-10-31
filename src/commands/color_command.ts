import { SlashCommandBuilder } from "@discordjs/builders";

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
const colorAsync = async(interaction: any): Promise<void> => {
    const subc = interaction.options.getSubcommand();

    switch (subc) {
        case ColorSubCommand.Set:
            await setMemberColorRoleAsync(interaction, interaction.content);
            break;

        case ColorSubCommand.Clear:
            break;

        case ColorSubCommand.List:
            break;
    }

    await interaction.reply("hlo");
}

/**
 * Set a color role for a given member. If the user has a color already, remove the
 * color role from the user and check if it can be removed from the server entirely
 * 
 * @param {Interaction} interaction - interaction which triggered the command
 * @param {string} color - color the user has entered
 */
const setMemberColorRoleAsync = async(interaction: any, color: string): Promise<void> => {
    console.log(color)
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription("Manage the color of your user in the server")
        .addSubcommand(x => x
			.setName(ColorSubCommand.Set)
			.setDescription("Set your personal color"))
        .addSubcommand(x => x
			.setName(ColorSubCommand.Clear)
			.setDescription("Clear your personal color")),

    async execute(interaction: any) {
        await colorAsync(interaction);
    }
}