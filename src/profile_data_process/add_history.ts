import chalk = require('chalk');
import { getUserHistoricalFile, writeUserHistoricalFile } from '../helper_functions/hist_files';
import { ProfileStatsBase, YoutubeStats } from '../stats_getters/stats_defs';
import { VanityPlateProfile, VanityPlateProfileStats } from './profile_data';

/** Add timestamp associated indexes to updated follower counts to allow for historical insights */
export async function addHistory(
    profile: VanityPlateProfile,
    stats: VanityPlateProfileStats,
    outputDir: string,
    writeFile: boolean = true
): Promise<HistoryFile> {
    // Read in previous historical file if it already exists
    const historyFromFile: HistoryFile | undefined = await getUserHistoricalFile(profile.id, outputDir);
    let history: HistoryFile = historyFromFile != undefined ? historyFromFile : new HistoryFile();

    // Get all accounts for all platforms that associated stats
    const accounts = VanityPlateProfileStats.getConcatStatsArray(stats);
    // Add historical follower counts for every platform
    for (const a of accounts) {
        history = addHistoryFromAccountStat(history, a, CountUnit.Followers);
    }
    // Add historical view counts for youtube accounts
    for (const y of stats?.youtubeStats) {
        history = addHistoryFromAccountStat(history, y, CountUnit.Views);
    }

    // Write updated object to file
    if (writeFile) {
        await writeUserHistoricalFile(profile.id, outputDir, history);
    }
    return history;
}

function addHistoryFromAccountStat(
    history: HistoryFile,
    account: ProfileStatsBase,
    countUnits: CountUnit = CountUnit.Followers
): HistoryFile {
    let f = history.histories.find(
        (h) => h.platformName === account.platformName && h.username === account.username && h.countUnits == countUnits
    );
    // default to follower count
    let count = new HistoryEntry(account.followerCount);
    if (countUnits == CountUnit.Views) {
        count = new HistoryEntry((account as YoutubeStats).totalViews);
    }
    if (!f) {
        const histObj: HistoryIndex = new HistoryIndex(account.platformName, account.username, countUnits);
        histObj.historicalCounts = addCountToHistoryEntries(histObj.historicalCounts, count);
        history.histories.push(histObj);
    } else {
        f.historicalCounts = addCountToHistoryEntries(f.historicalCounts, count);
    }
    return history;
}

function addCountToHistoryEntries(historicalCounts: HistoryEntry[], count: HistoryEntry): HistoryEntry[] {
    historicalCounts = sortHistoricalCounts(historicalCounts);
    // Only push the latest count retrieved if it differs from the last recorded count (no need for duplicates)
    const lastCount = historicalCounts[historicalCounts.length - 1];
    if (!lastCount || lastCount.count != count.count) {
        historicalCounts.push(count);
    } else {
        console.log(chalk.blue(`Not adding to history. ${count.count} matches the last recorded value`));
    }
    return historicalCounts;
}

function sortHistoricalCounts(entries: HistoryEntry[]): HistoryEntry[] {
    return entries.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
}

export class HistoryFile {
    public histories: HistoryIndex[] = [];
}

export class HistoryIndex {
    public platformName: string = '';
    public username: string = '';
    public countUnits: CountUnit = CountUnit.Followers;
    public historicalCounts: HistoryEntry[] = [];
    constructor(platformName: string, username: string, countUnits: CountUnit = CountUnit.Followers) {
        this.platformName = platformName;
        this.username = username;
        this.countUnits = countUnits;
        this.historicalCounts = [];
    }
}

export class HistoryEntry {
    public count: number = 0;
    public timestamp: number = -1;
    constructor(count: number) {
        this.count = count;
        this.timestamp = new Date().getTime();
    }
}

export enum CountUnit {
    Followers,
    Views,
    Likes,
}
