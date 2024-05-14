import { getProfileStatsJsonData } from '../../helper_functions/def_files';
import { mergeStats } from '../../profile_data_process/merge_stats';
import { VanityPlateProfileStats } from '../../profile_data_process/profile_data';
const fs = require('fs'); // Built-in filesystem package for Node.js

async function main() {
    // Get profile's old stats
    const profileOldStats: VanityPlateProfileStats | undefined = await getProfileStatsJsonData(
        'old',
        './src/tests/merge_stats_test/'
    );
    // Cast parsed json to class instance
    const profileOldStatsObj = VanityPlateProfileStats.rawToObject(profileOldStats);

    // Get profile's new stats
    const profileNewStats: VanityPlateProfileStats | undefined = await getProfileStatsJsonData(
        'new',
        './src/tests/merge_stats_test/'
    );
    // Cast parsed json to class instance
    const profileNewStatsObj = VanityPlateProfileStats.rawToObject(profileNewStats);

    // Merge new stats onto old stats
    const mergedStats = mergeStats(profileOldStatsObj, profileNewStatsObj);
    // Write merged stats to json
    fs.writeFile('./src/tests/merge_stats_test/merged-stats.json', JSON.stringify(mergedStats, undefined, 4), (err) => {
        if (err) throw err;
    });

    // List of every profile object within the merged stats object
    const concatStats = VanityPlateProfileStats.getConcatStatsArray(mergedStats);
    // Check each profile within the merged stats object
    for (const profile of concatStats) {
        if (!profile.iconBase64) {
            switch (profile.platformName) {
                case 'YouTube':
                case 'Instagram':
                case 'SoundCloud':
                case 'Threads':
                    throw new Error('Unable to merge icon for ' + profile.platformName);
                case 'Newgrounds':
                case 'Spotify':
                case 'Tik Tok':
                case 'Twitter':
                default:
                    break;
            }
        }
    }
}

main();
