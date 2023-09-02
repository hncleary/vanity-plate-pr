import { BrowserContext } from "playwright";
import { VanityPlateProfile, VanityPlateProfileStats, getProfileStats } from "../profile_data_process/profile_data";
import { getProfileJsonDef, writeProfileStatsToJson } from "../helper_functions/def_files";
const fs = require('fs') // Built-in filesystem package for Node.js
const util = require('util');

const readFile = util.promisify(fs.readFile);

const { chromium } = require('playwright');
(async () => { 
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 

    // Get all stats for test profile definition, write to file
    const testProfile: VanityPlateProfile = await getProfileJsonDef('test');
    const profileStats: VanityPlateProfileStats = await getProfileStats(context, testProfile);
    await writeProfileStatsToJson(testProfile, profileStats);
    // Print All Stats
    VanityPlateProfileStats.printAll(profileStats);
    // Close the headless browser
    await browser.close(); 
})();
