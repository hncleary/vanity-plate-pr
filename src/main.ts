import { profileStatsGetter } from './profile_def_stats_getter';

const args = process.argv.slice(2);

if (args.length === 2) {
    profileStatsGetter(args[0], args[1]);
} else {
    profileStatsGetter();
}
