import {
    getDirectoryFilesList,
    getProfileJsonDef,
    getProfileStatsJsonData,
    getProfileStatsJsonsList,
} from '../helper_functions/def_files';
import { addHistory } from '../profile_data_process/add_history';
import { VanityPlateProfile, VanityPlateProfileStats } from '../profile_data_process/profile_data';

async function main() {
    const inputDir = '../vanity-plate-db/profile-defs';
    const outputDir = '../vanity-plate-db/stats-v2/';
    const historicalFilesDir = '../vanity-plate-db/db-history/';

    // List out every folder within the db historical files directory
    let folders = await getDirectoryFilesList(historicalFilesDir);
    folders = folders.filter((f) => !!Number(f));

    // Iterate over every folder within the db historical files directory
    for (const folder of folders) {
        const statsFiles = await getProfileStatsJsonsList(`${historicalFilesDir}${folder}`);
        // Iterate over each account stats object within the db historical files directory
        for (const stat of statsFiles) {
            let username = stat.split('-stats.json')[0];
            if (username == 'doladark') {
                username = 'dolandark';
            }
            const profileObject: VanityPlateProfile = await getProfileJsonDef(username, inputDir);
            const statsObj: VanityPlateProfileStats | undefined = await getProfileStatsJsonData(
                username,
                `${historicalFilesDir}${folder}/`
            );
            if (statsObj && profileObject) {
                // Add historical entries to db documents
                await addHistory(profileObject, statsObj, outputDir);
            }
        }
    }
}

main();
