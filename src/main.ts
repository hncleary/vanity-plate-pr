import chalk = require('chalk');
import { profileStatsGetter } from './profile_def_stats_getter';

const args = process.argv.slice(2);

console.log(chalk.green('Main Started'));

if (args.length >= 2) {
    profileStatsGetter(args[0], args[1], args[2]);
} else {
    profileStatsGetter();
}
