/**
 * @description
 * The bunkest of bots, first of his name. Bunkbot is a small sandbox discord bot 
 * meant for privately run servers who want a strange sandbox bot to run and customize for fun.
 * 
 * This is the main entry file that will boot the bot, running the `npm run bot` command. This
 * file calls the core boot function which will load the discord dev token and initialize the bot.
 * 
 * Once the bot is ready, it will register commands and server configuration for all pre-configured 
 * servers (or guilds), as well as act as a primary event handler for various discord events.
 */
import { Client, Intents } from "discord.js";
import { logInfoAsync } from "./channel";
import { logError, logSuccess } from "./db";
import { 
    bootAsync, DiscordEvents, EMOJI_ROBOT, 
    getDefaultServer, registerCacheAndCommandsAsync 
} from "./core";

const client: Client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_PRESENCES
    ]
});

client.once(DiscordEvents.Ready, () => {
    try {
        registerCacheAndCommandsAsync(client).then(() => {
            logInfoAsync(getDefaultServer(), `${EMOJI_ROBOT} Bot loaded ${EMOJI_ROBOT}`);
            logSuccess("Bunkbot loaded!");
        });
    } catch(e) {
        logError(`Error registering servers: ${e}`);
    }
});

try {
    bootAsync(client);
} catch (e) {
    logError(`Unable to boot bunkbot: ${e}`);
}
