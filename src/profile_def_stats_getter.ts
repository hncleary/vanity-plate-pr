import { chromium, BrowserContext } from 'playwright';
import {
    getProfileDefJsonsList,
    getFileContents,
    writeProfileStatsToJson,
    writeSummaryCollectionToJson,
} from './helper_functions/def_files';
import {
    VanityPlateSum,
    VanityPlateProfile,
    VanityPlateProfileStats,
    getProfileStats,
    getProfileStatsSummation,
    VanityPlateSumCollection,
} from './profile_data_process/profile_data';
import chalk = require('chalk');

export async function profileStatsGetter(
    inputDir: string = './profile-defs/',
    outputDir: string = './profile-defs/',
    specifiedProfile: string = ''
) {
    if (!!specifiedProfile) {
        console.log('Specified profile: ' + specifiedProfile);
    }
    // Launch playwright browser
    const browser = await chromium.launch();
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' +
            ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    });
    /** Get the list of available profile definition JSON files*/
    let profileDefList: string[] = await getProfileDefJsonsList(inputDir);
    /** Filter out any profile defs that don't match the specified profile (if there is one specified) */
    if (!!specifiedProfile) {
        profileDefList = profileDefList.filter((p) => p == `${specifiedProfile}.json`);
    }
    const summaryList: VanityPlateSum[] = [];
    // Get the time at which the total process started
    const totalStartTime = new Date().getTime();
    // Set count for total number of profiles processed
    let profileCount = 0;
    for (const profileJson of profileDefList) {
        // Parse profile object from JSON file
        const json: string = await getFileContents(`${inputDir}${profileJson}`);
        const profile: VanityPlateProfile = JSON.parse(json);
        // Fetch social stats for profile
        if (!!profile.id) {
            // Get the time at which the process for this user started
            const timeStart = new Date().getTime();
            console.log(`[[Getting stats for ${profile.id}]]`);
            const profileStats: VanityPlateProfileStats = await getProfileStats(context, profile);

            // TODO - Validate retrieved stats to ensure that database doesn't regress (values should not be set to default -1 or 0 on error)

            // Write cumulative profile stats to .json
            await writeProfileStatsToJson(profile, profileStats, outputDir);
            // Get the time at which the process for this user ended
            const timeEnd = new Date().getTime();
            console.log(
                chalk.green(
                    `-> Retrieved Stats for ${profile.id} in ${Math.ceil((timeEnd - timeStart) / 1000)} seconds`
                )
            );
            summaryList.push(getProfileStatsSummation(profile.id, profile.displayName, profileStats));
            profileCount++;
        }
    }
    // Get the time at which the total process ended
    const totalEndTime = new Date().getTime();
    console.log(
        `-> Retrieved Stats for ${profileCount} profiles in ${Math.ceil(
            (totalEndTime - totalStartTime) / 1000
        )} seconds`
    );
    const sumCollection = new VanityPlateSumCollection(summaryList);
    writeSummaryCollectionToJson(sumCollection, outputDir);
    // Close the headless browser
    await browser.close();
}
