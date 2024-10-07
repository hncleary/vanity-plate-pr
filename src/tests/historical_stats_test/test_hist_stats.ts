import { getProfileJsonDef, getProfileStatsJsonData } from '../../helper_functions/def_files';
import { addHistory } from '../../profile_data_process/add_history';
import { VanityPlateProfile, VanityPlateProfileStats } from '../../profile_data_process/profile_data';

async function main() {
    // Get test profile object
    const profile: VanityPlateProfile | undefined = await getProfileJsonDef(
        'test',
        './src/tests/historical_stats_test/'
    );

    // Get test profile stats object
    const profileStats: VanityPlateProfileStats | undefined = await getProfileStatsJsonData(
        'test',
        './src/tests/historical_stats_test/'
    );

    const history = await addHistory(profile, profileStats, './src/tests/historical_stats_test/');
}

main();
