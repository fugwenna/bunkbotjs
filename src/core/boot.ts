/**
 * @description
 * This file contains all of the necessary functions for
 * bootstrapping the bot and registering all commands and 
 * server/guild configuration at the time of load
 */
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, OAuth2Guild } from "discord.js";

import { collectServer, IServer } from "./server";
import { 
    DOC_CONFIG, IBotCoreConfigDocument, 
    initializeDatabaseAsync, getDocByKeyAsync, 
    logInfo, logError, logSuccess 
} from "../db";
import { logErrorAsync } from "./channel";
import { getCommandFiles } from "./command";

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
 * Once the bot has officially been booted and calls it"s 
 * ready event, register all (slash) commands and load server configuration
 * into the "in-mem cache" object to reduce hits on the db
 * 
 * @param {Client} client - Discord client instance
 */
export const registerCacheAndCommandsAsync = async(client: Client): Promise<void> => {
    try {
        const guilds: GuildCollection = await client.guilds.fetch();
        const serverLength = client.guilds.cache.size;
        const guildRefs: OAuth2Guild[] = [];

        guilds.forEach(g => guildRefs.push(g));

        const resolveFnAsync: Function = async(guilds: GuildCollection, index: number): Promise<void> => {
            const guild = guildRefs[index];
            const server = collectServer(guild, client);

            try {
                if (index < serverLength) {
                    server.config = await getDocByKeyAsync(server.id);
                    await registerCommandsAsync(server);
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

/**
 * Register application wide slash commands
 * 
 * @param {IServer} server - server which to register commands
 */
const registerCommandsAsync = async(server: IServer) => {
    const doc = await getDocByKeyAsync<IBotCoreConfigDocument>(DOC_CONFIG);
    const commandFiles = getCommandFiles("./dist/commands", server.clientRef);

    try {
        const rest = new REST({ version: "9" }).setToken(doc.discordDevToken);
    
        await rest.put(
            Routes.applicationGuildCommands(doc.clientId, server.id),
            { body: commandFiles.map(c => c.data.toJSON()) },
        );

        //await rest.put(
        //    Routes.applicationCommands(doc.clientId),
        //    { body: [] },
        //);
    
        logSuccess("\nSuccessfully reloaded application (/) commands");
    } catch (error) {
        logError(`registerCommandsAsync: ${error}`);
    }
}