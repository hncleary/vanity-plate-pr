import chalk = require('chalk');
import { profileStatsGetter } from './profile_def_stats_getter';

const args = process.argv.slice(2);

console.log(chalk.green('Main Started'));

if (args.length >= 2) {
    // Parse optional concurrent parameters
    const concurrentLimit = args[3] ? parseInt(args[3]) : 3;
    const batchDelay = args[4] ? parseInt(args[4]) : 2000;

    console.log(chalk.blue(`Concurrent settings: limit=${concurrentLimit}, delay=${batchDelay}ms`));

    profileStatsGetter(args[0], args[1], args[2], concurrentLimit, batchDelay);
} else {
    profileStatsGetter();
}
