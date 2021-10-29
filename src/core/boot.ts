/**
 * @description
 * This file contains all of the necessary functions for
 * bootstrapping the bot and registering all commands and 
 * server/guild configuration at the time of load
 */
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types";
import { Client, Collection, OAuth2Guild } from "discord.js";

import { collectServer } from "./server";
import { 
    DOC_CONFIG, IBotCoreConfigDocument, 
    initializeDatabaseAsync, getDocByKeyAsync, 
    logInfo, logError 
} from "../db";
import { logErrorAsync } from "../channel/channel";
import { getCommandFiles } from "../tools";

type GuildCollection = Collection<string, OAuth2Guild>;

/**
 * Entry function that will initialize the database and load the
 * core config document which will be used to boot the bot
 * 
 * @param {Client} client - Discord client instance
 * @returns the core configuration document holding the discord dev key
 */
export const bootAsync = async(client: Client): Promise<void> => {
    logInfo("Booting Bunkbot...");
    await initializeDatabaseAsync();
    const doc = await getDocByKeyAsync<IBotCoreConfigDocument>(DOC_CONFIG);

    client.login(doc.discordDevToken);
}

/**
 * Once the bot has officially been booted and calls it's 
 * ready event, register all (slash) commands and load server configuration
 * into the "in-mem cache" object to reduce hits on the db
 * 
 * @param {Client} client - Discord client instance
 */
export const registerCacheAndCommandsAsync = async(client: Client): Promise<void> => {
    // TODO - will want to loop over directories for .command files to load
    //const commandFiles = getCommandFiles();

    try {
        const guilds: GuildCollection = await client.guilds.fetch();
        const serverLength = client.guilds.cache.size;
        const guildRefs: OAuth2Guild[] = [];

        guilds.forEach(g => guildRefs.push(g));

        const resolveFnAsync: Function = async(guilds: GuildCollection, index: number): Promise<void> => {
            const serverId = guildRefs[index]?.id;
            const server = collectServer(serverId, client);

            try {
                if (index < serverLength) {
                    server.config = await getDocByKeyAsync(serverId);
                    await resolveFnAsync(guilds, index + 1);
                }
            } catch (e) {
                logError(`registerCacheAndCommandsAsync: ${e}`);
                await logErrorAsync(server, `Error setting server config`);
            }
        };

        await resolveFnAsync(guilds, 0);
    } catch (e) {
        throw e;
    }
}