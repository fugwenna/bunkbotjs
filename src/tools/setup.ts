import colors from "colors";
import * as readline from "readline";

import { 
    DOC_CONFIG, DOC_GAMES, logSuccess, logWarning, logError, logInfo,
    ITokenDocument, IBotCoreConfigDocument, IBotServerConfigDocument, IBotGamesDocument,
    getDocByKeyAsync, saveDocumentAsync, initializeDatabaseAsync, closeDatabaseAsync, printAllDocsAsync, 
} from "../db";

const IO = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getUserInputAsync = async(promptMsg: string): Promise<string> => {
    return new Promise((res: Function) => {
        IO.question(colors.cyan(promptMsg), (token: string) => {
            res(token);
        });
    });
}

const configureDatabaseAsync = async(): Promise<void> => {
    await configureDiscordTokenAsync();
    await configureGamesAsync();
    await configureServerOptionsAsync();

    IO.close();
}

const configureDiscordTokenAsync = async(): Promise<void> => {
    const config: IBotCoreConfigDocument = await getDocByKeyAsync<IBotCoreConfigDocument>(DOC_CONFIG, {
        discordDevToken: "",
        tokens: {}
    });

    if (config?.discordDevToken != "") {
        logWarning("Discord dev token already exists!");
        logInfo(`To modify the dev token, run ${"npm run export".green} to manually change it, and reload with ${"npm run load".green}\n`);
    } else {
        const msg = "Enter Discord dev token: ";
        const discordToken = await getUserInputAsync(msg);

        if (discordToken && discordToken.trim() != "") {
            await saveDocumentAsync<IBotCoreConfigDocument>(DOC_CONFIG, {
                discordDevToken: discordToken,
                tokens: config.tokens
            });

            logSuccess("Discord dev token saved to database\n");
        }
    }

    const updateTokens = await getUserInputAsync("Update core API tokens? [y/N]: ");

    if (isYesResponse(updateTokens)) {
        await configureTokensAsync(config);
        await saveDocumentAsync<IBotCoreConfigDocument>(DOC_CONFIG, config);
    }
}

const configureGamesAsync = async(): Promise<void> => {
    const games = await getDocByKeyAsync<IBotGamesDocument>(DOC_GAMES, {
        gameNames: []
    });

    if (!games.gameNames.length)
        logWarning("No games yet configured, continuing.");
}

const configureTokensAsync = async(config: ITokenDocument): Promise<ITokenDocument> => {
    const yt = await getUserInputAsync("Set youtube API token: ");
    if (yt) {
        config.tokens.youtubeApiToken = yt;
        logSuccess(`Set youtube API token: ${config.tokens.youtubeApiToken}\n`);
    } else {
        logWarning("Skipping youtube API token update.\n");
    }

    const cb = await getUserInputAsync("Set cleverbot API token: ");
    if (cb) {
        config.tokens.cleverbotApiToken = cb;
        logSuccess(`Set cleverbot API token: ${config.tokens.cleverbotApiToken}\n`);
    } else {
        logWarning("Skipping cleverbot API token update.\n");
    }

    const tt = await getUserInputAsync("Set tenor API token: ");
    if (tt) {
        config.tokens.tenorApiToken = tt;
        logSuccess(`Set tenor API token: ${config.tokens.tenorApiToken}`);
    } else {
        logWarning("Skipping tenor API token update.");
    }

    return config;
}

const configureServerOptionsAsync = async(): Promise<void> => {
    let breakLoop: boolean = false;
    let serverConfig: IBotServerConfigDocument;

    const configureServerAsync = async (config: IBotServerConfigDocument): Promise<IBotServerConfigDocument> => {
        const serverId = await getUserInputAsync("\nEnter server id ('exit' to quit): ");

        if (!serverId || ["", "exit"].includes(serverId?.toLowerCase())) {
            logSuccess("Config complete, exiting.\n");

            await printAllDocsAsync();
            process.exit(0);
        } else {
            if (serverId) {
                config = await getDocByKeyAsync<IBotServerConfigDocument>(serverId, {
                    isServerConfig: true
                });
            }
        }

        return config;
    }

    const configureChannelsAndRolesAsync = async(config: IBotServerConfigDocument): Promise<IBotServerConfigDocument> => {
        if (!config.channels)
            config.channels = {};

        if (!config.roles)
            config.roles = {};

        if (!config.tokens)
            config.tokens = {};

        let ask = true;

        const updateChannel = await getUserInputAsync("Update channel config? [y/N]: ");
        ask = isYesResponse(updateChannel);

        if (ask)
            console.log();

        if (ask) {
            const gen = await getUserInputAsync("Set general (default 'general'): ");
            config.channels.general = gen ? gen : "general";
            logSuccess(`Set general channel: ${config.channels.general}\n`);

            const log = await getUserInputAsync("Set log (default 'bot-logs'): ");
            config.channels.log = log ? log : "bot-logs";
            logSuccess(`Set logs channel: ${config.channels.log}\n`);

            const games = await getUserInputAsync("Set custom-games (default 'custom-games'): ");
            config.channels.customGames = games ? games : "custom-games";
            logSuccess(`Set logs channel: ${config.channels.customGames}\n`);

            const jail = await getUserInputAsync("Set muted jail (default 'muted-jail'): ");
            config.channels.jail = jail ? jail : "muted-jail";
            logSuccess(`Set jail channel: ${config.channels.jail}\n`);
        }

        const updateRole = await getUserInputAsync("Update role config? [y/N]: ");
        ask = isYesResponse(updateRole);

        if (ask) {
            console.log("\n");

            const moderator = await getUserInputAsync("Set moderator role (default 'moderator'): ");
            config.roles.moderator = moderator ? moderator : "moderator";
            config.roles.moderatorPerms = `${config.roles.moderator}_perms`;
            logSuccess(`Set role: ${config.roles.moderator}`);
            logSuccess(`Set role: ${config.roles.moderatorPerms}\n`);

            const vip = await getUserInputAsync("Set vip role (default 'vip'): ");
            config.roles.vip = vip ? vip : "vip";
            config.roles.vipPerms = `${config.roles.vip}_perms`;
            logSuccess(`Set role: ${config.roles.vip}`);
            logSuccess(`Set role: ${config.roles.vipPerms}\n`);

            const gaming = await getUserInputAsync("Set gaming role (default 'gaming'): ");
            config.roles.gaming = gaming ? gaming : "gaming";
            config.roles.showGaming = `show_${config.roles.gaming}`;
            logSuccess(`Set role: ${config.roles.gaming}`);
            logSuccess(`Set role: ${config.roles.showGaming}\n`);

            const streaming = await getUserInputAsync("Set streaming role (default 'streaming'): ");
            config.roles.streaming = streaming ? streaming : "streaming";
            logSuccess(`Set role: ${config.roles.streaming}\n`);
        }

        return config;
    };

    while (!breakLoop) {
        serverConfig = await configureServerAsync(serverConfig);

        if (serverConfig) {
            serverConfig = await configureChannelsAndRolesAsync(serverConfig);

            const updateTokens = await getUserInputAsync("Update server API tokens? [y/N]: ");
            if (updateTokens) 
                await configureTokensAsync(serverConfig);

            await saveDocumentAsync(serverConfig._id, serverConfig);
        } else {
            breakLoop = true;
        }
    }
}

const isYesResponse = (val: string): boolean => {
    if (!val)
        return false;

    val = val.trim();

    return ["y", "yes"].includes(val.toLowerCase());
}

export const main = async(): Promise<void> => {
    try {
        await initializeDatabaseAsync();
        await configureDatabaseAsync();
    } catch (e) {
        logError(e);
    } finally {
        await closeDatabaseAsync();
    }
}

main();