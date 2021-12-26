/**
 * @description
 * Channel functions that are primarily used for
 * sending logs to a configured channel 
 */
import { GuildChannel, MessageEmbed } from "discord.js";
import { EMOJI_EXCLAMATION } from "./constants";
import { getServerById, IServer } from "./server";
import { logError } from "../db";

/**
 * Fetch a channel by name for a given server
 * 
 * @param {IServer} server - server to locate channel
 * @param {string} channelName - name of the channel to locate
 * @returns guild channel for the server
 */
const getServerChannel = (server: IServer, channelName: string): GuildChannel => {
    if (!channelName)
        return null;

    return <GuildChannel>server.clientRef.channels.cache
        .find(c => (<GuildChannel>c).name.toLowerCase() == channelName.toLowerCase());
}

/**
 * Send a message to a specific server channel
 * 
 * @param {IServer} server - server which to send the message
 * @param {string} channelName - channel which to send the message
 * @param {string} msg - message to send
 */
export const sendToChannelAsync = async(server: IServer, channelName: string, msg: string): Promise<boolean> => {
    const channel: any = getServerChannel(server, channelName);

    if (channel) {
        await channel.send(msg);
    } else {
        await logErrorAsync(server, `Unable to send message to channel: ${channelName}`);
        return false;
    }

    return true;
}

/**
 * Send a message to a specific server channel
 * 
 * @param {IServer} server - server which to send the message
 * @param {string} channelName - channel which to send the message
 * @param {MessageEmbed} embed - embedded message to send
 */
export const sendEmbedToChannelAsync = async(server: IServer, channelName: string, embed: MessageEmbed): Promise<boolean> => {
    const channel: any = getServerChannel(server, channelName);

    if (channel) {
        await channel.send({ embeds: [embed] });
    } else {
        await logErrorAsync(server, `Unable to send message to channel: ${channelName}`);
        return false;
    }

    return true;
}

/**
 * Log information to a configured log channel for each server
 * 
 * @param {IServer} server  - server cache object which to log info
 * @param {string} msg - information message to log
 */
export const logInfoAsync = async(server: IServer, msg: string): Promise<void> => {
    try {
        if (server) 
            await sendToChannelAsync(server, server.config?.channels?.log, msg);
        else 
            logError("logInfoAsync: Unable to locate server");
    } catch (e) {
        await logErrorAsync(server, `Unable to log info to server ${server?.id} - ${msg}`);
    }
}

/**
 * Log an error to a configured log channel for each server
 * 
 * @param {IServer} server - server cache object which to log error
 * @param {string} msg - error message to log
 */
export const logErrorAsync = async(server: IServer, msg: string): Promise<void> => {
    try {
        msg = `${EMOJI_EXCLAMATION} ${msg}`;
        const logged = await sendToChannelAsync(server, server.config?.channels.log, msg);

        if (!logged)
            throw new Error("Error not logged");
    } catch (e) {
        logError(`Unable to log error to server ${server?.id} - ${msg}`);
        logError(e);
    }
}

/**
 * Log an error to a configured server for 
 * 
 * @param {IServer} serverId - server id which to log error
 * @param {string} msg - error message to log
 */
export const logServerErrorAsync = async(serverId: string, msg: string): Promise<void> => {
    await logErrorAsync(getServerById(serverId),msg);
}