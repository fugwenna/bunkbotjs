/**
 * @description
 * Server functions and models that will act as a soft cache 
 * that holds a reference to the discord client so that other
 * functions can just pull the instance off of a singleton object
 */
import { Client, OAuth2Guild } from "discord.js";
import { DOC_CONFIG, getDocByKeyAsync, IBotCoreConfigDocument, IBotServerConfigDocument } from "../db";

/**
 * Interface that represents a 
 * loaded Discord guild (server) and
 * holds a reference to the client itself
 */
export interface IServer {
    id: string;
    clientRef: Client;
    guild: OAuth2Guild;
    config?: IBotServerConfigDocument;
}

/**
 * Fake server "cache" for quick lookup
 * and will store references by server id
 */
const SERVER_CACHE: { [serverId: string]: IServer } = { };

/**
 * Upon boot, collect a reference to a discord guild into "cache"
 * 
 * @param server - server to collect into cache
 * @param client - reference to the loaded discord client
 * @returns new configured server reference
 */
export const collectServer = (server: OAuth2Guild, client: Client): IServer => {
    if (!server?.id)
        return null;

    SERVER_CACHE[server.id] = {
        id: server.id,
        clientRef: client,
        guild: server
    };

    return SERVER_CACHE[server.id];
}

/**
 * Get the "default" core server (if it exists) 
 * 
 * @returns - Optionally configured default server
 */
export const getDefaultServer = (): IServer => {
    const srv = Object.keys(SERVER_CACHE)
        .map(k => SERVER_CACHE[k].config)
        .find(s => s.isDefaultServer);

    return SERVER_CACHE[srv?._id];
}

/**
 * Get the "default" core server (if it exists) 
 * 
 * @returns - Optionally configured default server
 */
export const getServerById = (serverId: string): IServer => {
    const srv = Object.keys(SERVER_CACHE)
        .map(k => SERVER_CACHE[k].config)
        .find(s => s._id == serverId);

    return SERVER_CACHE[srv?._id];
}

/**
 * Retrieve an API token for a given server (e.g. youtube API token). If
 * the server has not defined the API token for itself, check the core 
 * config document and use that token instead
 * 
 * @param {string} serverId - server which to retrieve token (if exists)
 * @param {string} tokenName - API token which to retrieve for a given command
 * @returns pre-configured API token 
 */
export const getServerApiTokenAsync = async(serverId: string, tokenName: string): Promise<string> => {
    const server = getServerById(serverId);
    const serverToken = server?.config.tokens[tokenName];

    if (serverToken)
        return serverToken;

    const config = await getDocByKeyAsync<IBotCoreConfigDocument>(DOC_CONFIG);
    return config.tokens[tokenName];
}