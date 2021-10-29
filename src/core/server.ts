/**
 * @description
 * Server functions and models that will act as a soft cache 
 * that holds a reference to the discord client so that other
 * functions can just pull the instance off of a singleton object
 */
import { Client } from "discord.js";
import { IBotServerConfigDocument } from "../db";

/**
 * Interface that represents a 
 * loaded Discord guild (server) and
 * holds a reference to the client itself
 */
export interface IServer {
    id: string;
    clientRef: Client;
    config?: IBotServerConfigDocument;
}

/**
 * Fake server "cache" for quick lookup
 * and will store references by server id
 */
const SERVER_CACHE: { [serverId: string]: IServer } = { 

};

/**
 * Upon boot, collect a reference to a discord guild into "cache"
 * 
 * @param serverId - server id to collect into cache
 * @param client - reference to the loaded discord client
 * @returns new configured server reference
 */
export const collectServer = (serverId: string, client: Client): IServer => {
    if (!serverId)
        return null;

    SERVER_CACHE[serverId] = {
        id: serverId,
        clientRef: client
    };

    return SERVER_CACHE[serverId];
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