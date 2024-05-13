import chalk = require('chalk');
import {
    VanityPlateProfile,
    VanityPlateProfileStats,
    VanityPlateSum,
    VanityPlateSumCollection,
} from '../profile_data_process/profile_data';

const fs = require('fs'); // Built-in filesystem package for Node.js
const util = require('util');

const readFile = util.promisify(fs.readFile);

export const profileDefsPath: string = 'profile-defs';

/** Write content to file in .html format
 * @NOTE Do note include '.html' in the filename parameter - it will be appended
 */
export async function writeHtmlToFile(filename: string, content: string): Promise<void> {
    fs.writeFile(`${profileDefsPath}/${filename}.html`, content, (err) => {
        if (err) throw err;
    });
}

/** Given a profile definition and its respective stats object, write profile stats to file */
export async function writeProfileStatsToJson(
    profile: VanityPlateProfile,
    stats: VanityPlateProfileStats,
    outputDir: string
): Promise<void> {
    if (!!profile.id) {
        fs.writeFile(`${outputDir}/${profile.id}-stats.json`, JSON.stringify(stats, undefined, 4), (err) => {
            if (err) throw err;
        });
    }
}

/** Write a VanityPlateSumCollection to the default .json file in the specified output directory */
export async function writeSummaryCollectionToJson(
    summaryCollection: VanityPlateSumCollection,
    outputDir: string
): Promise<void> {
    fs.writeFile(`${outputDir}/db_summary.json`, JSON.stringify(summaryCollection, undefined, 4), (err) => {
        if (err) throw err;
    });
}

/** If a stats json exists for the referenced user in the ouput directory, return the parsed data object */
export async function getProfileStatsJsonData(
    username: string,
    outputDir: string
): Promise<VanityPlateProfileStats | undefined> {
    console.log(`Retrieving ${outputDir}${username}-stats.json`);
    const json = await getFileContents(`${outputDir}${username}-stats.json`);
    if (!!json) {
        const profile: VanityPlateProfileStats = JSON.parse(json);
        return profile;
    } else {
        return undefined;
    }
}

/** Given a profiles identifying string, return their defined object */
export async function getProfileJsonDef(username: string, inputDir: string): Promise<VanityPlateProfile> {
    const json = await getFileContents(`${inputDir}/${username}.json`);
    const profile: VanityPlateProfile = JSON.parse(json);
    return profile;
}

/** Get a list of json files within the profile/defs directory */
export async function getProfileDefJsonsList(inputDir: string): Promise<string[]> {
    const dir = await fs.promises.opendir(inputDir);
    const fileNames: string[] = [];
    for await (const dirent of dir) {
        if (!dirent.name.includes('-stats.json') && dirent.name.includes('.json')) {
            fileNames.push(dirent.name);
        }
    }
    return fileNames;
}

/** Get the string contents of a file given location and name */
export async function getFileContents(filename: string): Promise<string> {
    try {
        const data = await readFile(filename, 'utf8');
        return data;
    } catch (err) {
        console.log(chalk.blue(`No file found for ${filename}`));
        return '';
    }
}
