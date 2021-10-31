/**
 * Roll a random number in a given range
 * 
 * @param min 
 * @param max 
 */
export const getRandomNumber = (min: number, max: number): number => {
    if (!min) min = 1;
    if (!max) max = 100;

    return Math.ceil(Math.random() * (max - min) + min);
}