import * as fs from "fs";
import PouchDB from "pouchdb"

import { IDocument, IBotServerConfigDocument, IExportedDatabaseDocument } from "./documents";
import { readJSONFile, writeJSONFile } from "../tools/filesystem";
import { logError, logSuccess, logInfo } from "./log";

/**
 * This is a "constant" (more like readonly) reference
 * to a single instance of the pouch database that will
 * be opened and read/write to.
 * 
 * @remarks
 * This will be opened upon the initialization of the bot
 */
let POUCHDB_DATABASE_REF: PouchDB.Database = null;

/**
 * Database constant document names
 */
export const DOC_CONFIG: string = "config";
export const DOC_GAMES: string = "games";

/**
 * Initialize the database before connecting
 * to the discord bot (re: bunkbot.ts)
 */
export const initializeDatabaseAsync = async(): Promise<void> => {
    await closeDatabaseAsync();

    // enable auto compaction since we don't need to store 
    // all revisions of the documents forever, and it shouldn't
    // impact performance for smaller servers
    POUCHDB_DATABASE_REF = new PouchDB("database", { auto_compaction: true });

    await printAllDocsAsync();
}

/**
 * When debug is enabled for setup, print all the documents
 * that have been configured
 * 
 * @param {boolean} [serversOnly] only print server information and not config/games
 */
export const printAllDocsAsync = async(serversOnly: boolean = true): Promise<void> => {
    const docs = await POUCHDB_DATABASE_REF.allDocs({ include_docs: true });

    if (serversOnly)
        docs.rows = docs.rows.filter(r => r.doc["isServerConfig"]);

    docs.rows.forEach(row => {
        const serverDoc = <IBotServerConfigDocument>row.doc;
        logInfo(`Loaded server: ${serverDoc._id}`);
        logInfo(`\tChannels: ${Object.keys(serverDoc.channels ?? {}).length > 0}`);
        logInfo(`\tRoles: ${Object.keys(serverDoc.roles ?? {}).length > 0}`);
        logInfo(`\tTokens: ${Object.keys(serverDoc.tokens ?? {}).length > 0}`);
    });

    console.log();
}

/**
 * Close the database if the ref is established
 */
export const closeDatabaseAsync = async(): Promise<void> => {
    if (POUCHDB_DATABASE_REF)
        await POUCHDB_DATABASE_REF.close();

    POUCHDB_DATABASE_REF = null;
}

/**
 * Returns a single document from the database, assumed
 * as a passed generic type
 * 
 * @param {string} key primary key/id of the document to retrieve - i.e. the server id
 * @param {T} [modelToCreate=null] Create the document if it does not exist (provided)
 * 
 * @returns mapped document model T
 */
export const getDocByKeyAsync = async<T extends IDocument>(key: string, modelToCreate: T = null): Promise<T> => {
    try {
        const doc = await POUCHDB_DATABASE_REF.get(key, {
            revs: true
        });

        return <any>doc as T;
    } catch (e) {
        if (e.status == 404 && !!modelToCreate) {
            return await saveDocumentAsync(key, modelToCreate, true);
        } else {
            throw e;
        }
    }
}

/**
 * Save a document (put or post) for a given key. If
 * the document does not contain a revision, get the
 * existing record (if it exists) and add the base revision
 * 
 * @param {string} key document key to set
 * @param {T} model document model to save
 * @param {boolean} [fromGet=false] do not attempt to refetch if it's from the get method
 */
export const saveDocumentAsync = async<T extends IDocument>(key: string, model: T,
    fromGet: boolean = false): Promise<T> => {

    model._id = key;

    if (!model._rev && !fromGet) {
        const ref = await getDocByKeyAsync(key);
        if (ref?._rev)
            model._rev = ref._rev;
    }

    await POUCHDB_DATABASE_REF.put(model);

    return model;
}

/**
 * Export the entire set of database documents into an output json file
 * 
 * @param {boolean} [closeConnection=true] close the database connection after export
 * @param {boolean} [copyOnly=false] only create the ./db.json file
 */
export const exportDocumentsAsync = async(closeConnection: boolean = true, copyOnly: boolean = false): Promise<void> => {
    if (!POUCHDB_DATABASE_REF)
        await initializeDatabaseAsync();

    try {
        const docs = await POUCHDB_DATABASE_REF.allDocs({ include_docs: true });
        const dbObject: IExportedDatabaseDocument = { servers: [] };

        docs.rows.forEach(row => {
            const doc = Object.assign(<IDocument>row.doc, {});

            switch (doc._id) {
                case DOC_CONFIG:
                    dbObject.config = doc;
                    break;

                case DOC_GAMES:
                    dbObject.games = doc;
                    break;

                default:
                    dbObject.servers.push(
                        <IBotServerConfigDocument>doc);
                    break;
            }

            delete doc._rev;
        });

        makeBackupDbFile(dbObject, copyOnly);
    } catch(e) {
        throw e;
    } finally {
        if (closeConnection)
            await closeDatabaseAsync();
    }
}

/**
 * Load a new set of database documents based on an input file
 * 
 * @remarks
 * The input file must be formatted as an IExportedDatabaseDocument
 * 
 * @param {string} filePath path to the document file
 */
export const loadDatabaseSync = async(filePath: string): Promise<void> => {
    try {
        if (!fs.existsSync(filePath)) {
            logError(`Cannot locate file path: ${filePath}`);
            return;
        }

        if (!POUCHDB_DATABASE_REF)
            await initializeDatabaseAsync();

        await exportDocumentsAsync(false); // save a snapshot of the current db in case we want to reload it

        const dbFile = readJSONFile<IExportedDatabaseDocument>(filePath);

        await saveDocumentAsync(DOC_CONFIG, dbFile.config);
        await saveDocumentAsync(DOC_GAMES, dbFile.games);

        const docs = await POUCHDB_DATABASE_REF.allDocs({ include_docs: true })
        docs.rows.forEach(r => {
            if (r.doc["isServerConfig"])
                POUCHDB_DATABASE_REF.remove(r.doc);
        });

        await dbFile.servers?.forEach(server => saveDocumentAsync(server._id, server, true));
        await exportDocumentsAsync(false, true); // save the copy 
    } catch (e) {
        logError(e);
    } finally {
        await closeDatabaseAsync();
    }
}

/**
 * Object to use to create a snapshot json file
 * of the current database
 * 
 * @param {IExportedDatabaseDocument} dbObject to back up
 * @param {boolean} [copyOnly=false] only create the ./db.json file
 */
export const makeBackupDbFile = (dbObject: IExportedDatabaseDocument, copyOnly: boolean = false): void => {
    const now = new Date();
    const monthVal = now.getMonth() + 1;
    const month = monthVal < 10 ? `0${monthVal}` : monthVal;
    const time = now.getTime()
    const date = `${now.getFullYear()}${month}${now.getDate()}_${time}`;
    const file = `./dist/backup/db_${date}.json`;

    if (copyOnly) {
        writeJSONFile("./db.json", dbObject);
        logSuccess(`Successfully created reload file: ${"./db.json".cyan}`);
    } else {
        writeJSONFile(file, dbObject);
        logSuccess(`Successfully created backup file: ${file.cyan}`);
    }
}