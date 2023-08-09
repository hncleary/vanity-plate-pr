/** Convert a number in abbreviate string format (1k, 1m, 1b) back to number format */
export function convertAbbreviateNumberStr(abbrevNum: string): number { 
    /** subscriber count are abbreviated with at 1K, 1M : use these to multiply back to original values */
    const multipliers: string[] = ["", "k", "m", "b"];
    /** Remove all spaces from the string */
    abbrevNum = abbrevNum.split(' ').join(''); 
    const num: number = parseFloat(abbrevNum.replace(/,/g, ''));
    let mult = '';
    if(abbrevNum.split(num.toString()).length > 1) { 
        mult = abbrevNum.split(num.toString())[1].toLowerCase();
    }
    /** 1000 to the power of the index of the multiplier n*1000^0, n**1000^1, n*1000^2 */
    const multFactor = 1000**multipliers.indexOf(mult); 
    return num * multFactor;
}