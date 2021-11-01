/**
 * @description
 * Models and functions to deal with bunkbot (slash) commands
 */
import * as fs from "fs"
import * as path from "path";
import colors from "colors";
import { Collection, Interaction } from "discord.js";

import { logInfo } from "../db";

/**
 * Each command file should export
 * a default function of 'command'
 */
export interface ICommand {
    data: any;
    execute: Function;
}

/**
 * Loop over the src root directory and retrieve any files 
 * that end in `_command.ts` and export a default command object
 * 
 * @param {string} filePath - root file path of the bot
 * @returns a list of valid commands
 */
export const getCommandFiles = (filePath: string, client: any): ICommand[] => {
    const contents = fs.readdirSync(filePath);
    client.commands = new Collection();

    const getCommands = (dir: string[]): ICommand[] => {
        const commands = [];

        dir.forEach(dof => {
            const fullPath = path.join(filePath, dof);

            if (fs.statSync(fullPath).isDirectory()) {
                commands.push(...getCommandFiles(dof, client));
            } else {
                const baseName = path.basename(fullPath);
                const baseSplit = baseName.split("_");
                const isCommandFile = baseSplit.length > 1 && baseSplit[1] == "command.js";

                if (isCommandFile) {
                    logInfo(`Loading command file: ${colors.green(baseName)}`);
                    const cmd: ICommand = require(fs.realpathSync(fullPath));
                    client.commands.set(cmd.data.name, cmd);
                    commands.push(cmd);
                }
            }
        });

        return commands;
    };

    return getCommands(contents);
}

/**
 * Handle a bot "interactionCreate" event, whether it be
 * an executed command, or a chat with bunkbot
 * 
 * @param {Interaction} interaction - interaction to handle
 */
export const handleInteractionAsync = async(interaction: Interaction): Promise<void> => {
    if (interaction.isSelectMenu()) {
        // TODO .. link back to youtube video somehow.. message id?
    } else if (interaction.isCommand()) {
        const commandRef = (<any>interaction.client)
            .commands?.get(interaction.commandName);

        if (!commandRef)
            return;

        await commandRef.execute(interaction);
    }
}