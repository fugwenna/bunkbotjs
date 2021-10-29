import { exportDocumentsAsync, loadDatabaseSync } from "../db";

module.exports = {
    export: () => exportDocumentsAsync(),
    load: (filePath: string) => loadDatabaseSync(filePath)
}