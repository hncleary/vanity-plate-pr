import { systemHasDisplay } from './helper_functions/has_display';
import { profileStatsGetter } from './profile_def_stats_getter';

const args = process.argv.slice(2);

systemHasDisplay();

if (args.length >= 2) {
    profileStatsGetter(args[0], args[1], args[2]);
} else {
    profileStatsGetter();
}
