import { chromium, BrowserContext, LaunchOptions } from 'playwright';
import {
    getProfileDefJsonsList,
    getFileContents,
    writeProfileStatsToJson,
    writeSummaryCollectionToJson,
    getProfileStatsJsonData,
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
import { RASP_PI_CHROMIUM_PATH, isRaspberryPi } from './helper_functions/chromium_raspberry_pi';
import { mergeStats } from './profile_data_process/merge_stats';
import { rawToObject } from './helper_functions/raw_to_object';

export async function profileStatsGetter(
    inputDir: string = './profile-defs/',
    outputDir: string = './profile-defs/',
    specifiedProfile: string = ''
) {
    if (!!specifiedProfile) {
        console.log('Specified profile: ' + specifiedProfile);
    }
    // Launch playwright browser
    let launchOptions: LaunchOptions = {};
    if (isRaspberryPi()) {
        console.log('RUNNING ON RASPBERRY PI');
        launchOptions = { channel: 'chrome', executablePath: RASP_PI_CHROMIUM_PATH };
    }
    const browser = await chromium.launch(launchOptions);
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' +
            ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    });
    /** Get the list of available profile definition JSON files*/
    let profileDefList: string[] = await getProfileDefJsonsList(inputDir);
    /** Shuffle the list of available profile definitions so that the retrieved order is different each time */
    profileDefList = profileDefList.sort((a, b) => 0.5 - Math.random());
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

            let profileStats: VanityPlateProfileStats = new VanityPlateProfileStats();
            const profileNewStats: VanityPlateProfileStats = await getProfileStats(context, profile);

            // Validate retrieved stats to ensure that database doesn't regress (values should not be set to default -1 or 0 on error), user old profile stats if new stats are not valid
            VanityPlateProfileStats.printAll(profileNewStats);
            let profileOldStats: VanityPlateProfileStats | undefined = await getProfileStatsJsonData(
                profile.id,
                outputDir
            );
            profileOldStats = VanityPlateProfileStats.rawToObject(profileOldStats);
            if (!!profileOldStats) {
                profileStats = mergeStats(profileOldStats, profileNewStats);
            } else {
                profileStats = profileNewStats;
            }

            // Write cumulative profile stats to .json
            await writeProfileStatsToJson(profile, profileNewStats, outputDir);
            // Get the time at which the process for this user ended
            const timeEnd = new Date().getTime();
            console.log(
                chalk.green(
                    `-> Retrieved Stats for ${profile.id} in ${Math.ceil((timeEnd - timeStart) / 1000)} seconds`
                )
            );
            summaryList.push(getProfileStatsSummation(profile.id, profile.displayName, profileNewStats));
            profileCount++;
        }
    }
    // Get the time at which the total process ended
    const totalEndTime = new Date().getTime();
    const seconds = Math.ceil((totalEndTime - totalStartTime) / 1000);
    const minutes = (seconds / 60).toFixed(2);
    console.log(`-> Retrieved Stats for ${profileCount} profiles in ${seconds} seconds (${minutes} minutes)`);
    const sumCollection = new VanityPlateSumCollection(summaryList);
    writeSummaryCollectionToJson(sumCollection, outputDir);
    // Close the headless browser
    await browser.close();
}
