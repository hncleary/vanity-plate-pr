import { HistoryFile } from '../profile_data_process/add_history';
import { getFileContents } from './def_files';

const fs = require('fs'); // Built-in filesystem package for Node.js
const util = require('util');
const readFile = util.promisify(fs.readFile);

function getFileName(profileName: string, outputDir: string): string {
    return `${outputDir}${profileName}-history.json`;
}

export async function getUserHistoricalFile(profileName: string, outputDir: string): Promise<HistoryFile | undefined> {
    const json = await getFileContents(getFileName(profileName, outputDir));
    if (!!json) {
        const profile: HistoryFile = JSON.parse(json);
        return !!profile ? profile : undefined;
    } else {
        return undefined;
    }
}

export async function writeUserHistoricalFile(
    profileName: string,
    outputDir: string,
    history: HistoryFile
): Promise<void> {
    fs.writeFile(getFileName(profileName, outputDir), JSON.stringify(history, undefined, 4), (err) => {
        if (err) throw err;
    });
}
