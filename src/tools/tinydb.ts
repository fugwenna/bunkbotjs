/**
 * @description
 * This is a simple migration script that will convert a legacy
 * TinyDB db.json file into the new format, removing all user refs
 * since bunkbotjs does not store user data
 */
import * as fs from "fs";
import { logError, IExportedDatabaseDocument } from "../db/index";
import { writeJSONFile, readJSONFile } from "./filesystem";

export const main = (): void => {
    // assume db.json as the default so it can be reloaded
    const dbjsonPath = "./db.json";

    if (!fs.existsSync) {
        logError(`Cannot locate file ${dbjsonPath}`);
        return;
    }
    
    try {
        const dbjson: any = readJSONFile(dbjsonPath);
        const newDB: IExportedDatabaseDocument = {};

        writeJSONFile(dbjsonPath, dbjson);
    } catch(e: any|unknown) {
        logError("Error reading db.json file");
    }
}