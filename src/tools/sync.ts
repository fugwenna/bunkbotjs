import { exportDocumentsAsync, loadDatabaseSync } from "../db/index";

module.exports = {
    export: () => exportDocumentsAsync(),
    load: (filePath: string) => loadDatabaseSync(filePath)
}