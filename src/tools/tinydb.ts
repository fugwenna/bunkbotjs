/**
 * @description
 * This is a simple migration script that will convert a legacy
 * TinyDB db.json file into the new format, removing all user refs
 * since bunkbotjs does not store user data
 */
import * as fs from "fs";
import colors from "colors";
import { logInfo, logError, IExportedDatabaseDocument } from "../db";
import { readJSONFile, writeJSONFile } from "./filesystem";

interface ITinyDbConfig {
    game_names: { 
        [index: string]: {
            name: string,
            type: string
        }
    }
}

export const main = (): void => {
    // assume db.json as the default so it can be reloaded
    const tinydbjsonPath = "./tinydb.json";
    const dbjsonPath = "./db.json";

    if (!fs.existsSync) {
        logError(`Cannot locate file ${tinydbjsonPath}`);
        return;
    }
    
    try {
        const tinydbjson: ITinyDbConfig = readJSONFile(tinydbjsonPath);
        const dbjson: IExportedDatabaseDocument = readJSONFile(dbjsonPath);

        if (!dbjson.games) 
            dbjson.games = { gameNames: [] };

        const gameNames: string[] = [];

        Object.keys(tinydbjson.game_names).forEach(gn => {
            const gname = tinydbjson.game_names[gn].name;
            logInfo(`Adding game: ${colors.green(gname)}`);

            gameNames.push(gname);
        });

        dbjson.games.gameNames = gameNames;

        writeJSONFile(dbjsonPath, dbjson);
    } catch(e) {
        logError("Error migrating db.json file");
        logError(e);
    }
}

main();