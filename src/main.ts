import { BrowserContext } from "playwright";
import { VanityPlateProfile, VanityPlateProfileStats, getProfileStats } from "./profile_data_process/profile_data";
import { getProfileDefJsonsList, getFileContents, writeProfileStatsToJson } from "./helper_functions/def_files";
const { chromium } = require('playwright');

async function main(inputDir: string = './profile-defs/', outputDir: string = './profile-defs/') {
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 
    /** Get the list of available profile definition JSON files*/
    const profileDefList = await getProfileDefJsonsList(inputDir);
    for(const profileJson of profileDefList) { 
        // Parse profile object from JSON file
        const json: string = await getFileContents(`${inputDir}${profileJson}`);
        const profile: VanityPlateProfile = JSON.parse(json);
        // Fetch social stats for profile
        if(!!profile.id) { 
            console.log(`[[Getting stats for ${profile.id}]]`)
            console.log('-----------')
            const profileStats: VanityPlateProfileStats = await getProfileStats(context, profile);
            // Write cumulative profile stats to .json
            await writeProfileStatsToJson(profile, profileStats, outputDir);
            // Print all stats objects
            VanityPlateProfileStats.printAll(profileStats);
            console.log('===================');
            console.log('===================');
        }
    }
    // Close the headless browser
    await browser.close(); 
}

const args = process.argv.slice(2);

if(args.length === 2) { 
    main(args[0], args[1]);
} else { 
    main();
}

