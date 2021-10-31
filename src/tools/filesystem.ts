import * as fs from "fs";
import * as path from "path";

/**
 * Read the contents of a JSON file
 * into a known type T
 * 
 * @param {string} filePath path to the JSON file to read
 * @returns JSON object of type T
 */
export const readJSONFile = <T>(filePath: string): T => {
    try {
        const fileContents = JSON.parse(fs.readFileSync(filePath).toString());
        return <T>fileContents;
    } catch (e: unknown) {
        return <T>{};
    }
}

/**
 * Write a new set of contents of type T to a known file path 
 * 
 * @param {string} filePath Path of the file to write
 * @param {T} contents Object contents of the JSON file to write
 */
export const writeJSONFile = <T>(filePath: string, contents: T): void => {
    const stringifiedContents = JSON.stringify(contents, null, 4);

    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);

    fs.writeFileSync(filePath, stringifiedContents);
}