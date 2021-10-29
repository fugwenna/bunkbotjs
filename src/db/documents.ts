/**
 * Basic root interface for 
 * the document database type
 */
export interface IDocument {
    _id?: string;
    _rev?: string;
}

/**
 * Reusable interface that assumes a token object
 */
export interface ITokenDocument extends IDocument {
    tokens?: IBotTokenDocument;
}

/**
 * "Singleton" config document which the
 * primary discord dev token will be stored 
 * under the "config" primary key
 */
export interface IBotCoreConfigDocument extends ITokenDocument {
    discordDevToken: string;
}

/**
 * "Singleton" config document which stores
 * all borrowed game names for bunkbot to play
 * 
 * @remarks
 * This pulls game names from all servers
 */
export interface IBotGamesDocument extends IDocument {
    gameNames?: string[]
}

/**
 * Optional token document - stores all optional
 * API tokens for a given server
 */
export interface IBotTokenDocument extends IDocument {
    cleverbotApiToken?: string;
    weatherApiToken?: string;
    tenorApiToken?: string;
    youtubeApiToken?: string;
}

/**
 * Role document - stores all role mappings for a given server
 */
export interface IBotRoleDocument extends IDocument {
    gaming?: string,
    showGaming?: string,
    streaming?: string,
    moderator?: string,
    moderatorPerms?: string,
    vip?: string,
    vipPerms?: string
}

/**
 * Channel document - stores all channel mappings for a given server
 */
export interface IBotChannelDocument extends IDocument {
    customGames?: string,
    general?: string,
    jail?: string,
    log?: string
}

/**
 * Specific config overrides per document
 */
export interface IBotServerConfigDocument extends ITokenDocument {
    isServerConfig: boolean, // always true (for query)
    isDefaultServer?: boolean; // optional
    roles?: IBotRoleDocument,
    channels?: IBotChannelDocument
}

/**
 * Model output that is created using the export script
 */
export interface IExportedDatabaseDocument {
    config?: IBotTokenDocument;
    games?: IBotGamesDocument;
    servers?: IBotServerConfigDocument[];
}