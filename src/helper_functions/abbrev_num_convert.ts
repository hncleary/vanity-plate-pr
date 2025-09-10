/** Convert a number in abbreviate string format (1k, 1m, 1b) back to number format */
export function convertAbbreviateNumberStr(abbrevNum: string): number {
    // subscriber count are abbreviated with at 1K, 1M : use these to multiply back to original values
    const multipliers: { [key: string]: number } = { '': 1, k: 1000, m: 1000000, b: 1000000000 };

    // Remove all spaces and commas from the string
    const cleanStr = abbrevNum.replace(/[\s,]/g, '');

    // Use regex to extract number and multiplier
    const match = cleanStr.match(/^([\d.]+)([kmb]?)$/i);

    if (!match) {
        return 0; // Return 0 for invalid input
    }

    const num = parseFloat(match[1]);
    const mult = match[2].toLowerCase();
    const multFactor = multipliers[mult] || 1;

    return num * multFactor;
}
