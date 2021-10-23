import colors from "colors";

/**
 * Write a green success message to the console
 * 
 * @param {string} message the message to display
 */
export const logSuccess = (message: string): void => {
    console.log(colors.green(message));
}

/**
 * Write an orange/yellow warning message to the console
 * 
 * @param {string} message the message to display
 */
export const logWarning = (message: string): void => {
    console.log(colors.yellow(`WARNING: ${message}`));
}

/**
 * Write a red error message to the console
 * 
 * @param {string} message the message to display
 */
export const logError = (message: string): void => {
    console.log(colors.red(`ERROR: ${message}`));
}

/**
 * Write a blue info message to the console
 * 
 * @param {string} message the message to display
 */
export const logInfo = (message: string): void => {
    console.log(colors.cyan(message));
}