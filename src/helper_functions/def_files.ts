import { VanityPlateProfile, VanityPlateProfileStats } from "../profile_data_process/profile_data";

const fs = require('fs') // Built-in filesystem package for Node.js
const util = require('util');

const readFile = util.promisify(fs.readFile);

export const profileDefsPath: string = 'profile-defs'

/** Given a profile definition and its respective stats object, write profile stats to file */
export async function writeProfileStatsToJson(profile: VanityPlateProfile, stats: VanityPlateProfileStats): Promise<void> { 
    if(!!profile.id) { 
        fs.writeFile(`${profileDefsPath}/${profile.id}-stats.json`, JSON.stringify(stats), (err) => {
            if (err) throw err;
        })
    }
}

/** Given a profiles identifying string, return their defined object */
export async function getProfileJsonDef(username: string): Promise<VanityPlateProfile> { 
    const json = await getFileContents(`${profileDefsPath}/${username}.json`);
    const profile: VanityPlateProfile = JSON.parse(json);
    return profile;
}

// Get a list of json files within the profile/defs directory
export async function getProfileDefJsonsList(): Promise<string[]> {
    const dir = await fs.promises.opendir(profileDefsPath)
    const fileNames: string[] = [];
    for await (const dirent of dir) {
        fileNames.push(dirent.name);
    }
    return fileNames;
}

/** Get the string contents of a file given location and name */
export async function getFileContents(filename: string): Promise<string> { 
    const data = await readFile(filename, 'utf8');
    return data;
} 