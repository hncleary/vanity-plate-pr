import { BrowserContext } from "playwright";
import { VanityPlateProfile, VanityPlateProfileStats, getProfileStats } from "./profile_data_process/profile_data";
const fs = require('fs') // Built-in filesystem package for Node.js
const util = require('util');

const readFile = util.promisify(fs.readFile);

const { chromium } = require('playwright');
(async () => { 
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 
    /** Get the list of available profile definition JSON files*/
    const profileDefList = await getProfileDefJsonsList();
    for(const profileJson of profileDefList) { 
        // Parse profile object from JSON file
        const json: string = await getFileContents(`./profile-defs/${profileJson}`);
        const profile: VanityPlateProfile = JSON.parse(json);
        // Fetch social stats for profile
        const profileStats: VanityPlateProfileStats = await getProfileStats(context, profile);
        // Write cumulative profile stats to .json
        if(!!profile.id) { 
            fs.writeFile(`./profile-defs/${profile.id}-stats.json`, JSON.stringify(profileStats), (err) => {
                if (err) throw err;
            })
        }
    }
    // Close the headless browser
    await browser.close(); 
})();

// Get a list of json files within the profile/defs directory
async function getProfileDefJsonsList(): Promise<string[]> {
    const path = './profile-defs/';
    const dir = await fs.promises.opendir(path)
    const fileNames: string[] = [];
    for await (const dirent of dir) {
        fileNames.push(dirent.name);
    }
    return fileNames;
}

/** Get the string contents of a file given location and name */
async function getFileContents(filename: string): Promise<string> { 
    const data = await readFile(filename, 'utf8');
    return data;
} 