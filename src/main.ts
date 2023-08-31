import { BrowserContext } from "playwright";
import { VanityPlateProfile, VanityPlateProfileStats, getProfileStats } from "./profile_data_process/profile_data";
import { getProfileDefJsonsList, getFileContents, writeProfileStatsToJson } from "./helper_functions/def_files";
const fs = require('fs') // Built-in filesystem package for Node.js
const util = require('util');

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
        if(!!profile.id) { 
             // Fetch social stats for profile
            const profileStats: VanityPlateProfileStats = await getProfileStats(context, profile);
            // Write cumulative profile stats to .json
            await writeProfileStatsToJson(profile, profileStats);
        }
    }
    // Close the headless browser
    await browser.close(); 
})();

