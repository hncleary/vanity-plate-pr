import { BrowserContext } from 'playwright';
import { getInstagramStatsArr } from '../stats_getters/instagram_stats';
import { getNewgroundsStatsArr } from '../stats_getters/newgrounds_stats';
import { getSpotifyStatsArr } from '../stats_getters/spotify_stats';
import { getYoutubeStatsArr } from '../stats_getters/youtube_stats';
import { getSoundcloudStatsArr } from '../stats_getters/soundcloud_stats';
import { getTwitterStatsArr } from '../stats_getters/twitter_stats';
import { getTwitchStatsArr } from '../stats_getters/twitch_stats';
import { getTikTokStatsArr } from '../stats_getters/tiktok_stats';
import {
    FacebookStats,
    InstagramStats,
    NewgroundsStats,
    ProfileStatsBase,
    SoundCloudStats,
    SpotifyStats,
    ThreadsStats,
    TiktokStats,
    TwitchStats,
    TwitterStats,
    YoutubeStats,
} from '../stats_getters/stats_defs';
import chalk = require('chalk');
import { getThreadsStatsArr } from '../stats_getters/threads_stats';
import { rawToObject } from '../helper_functions/raw_to_object';
import { getFacebookStatsArr } from '../stats_getters/facebook_stats';

/** Profile definition defining lists of social identifiers */
export class VanityPlateProfile {
    public id: string = '';
    public displayName: string = '';
    // Account Lists
    public youtubeHandles: string[] = [];
    public instagramHandles: string[] = [];
    public threadsHandles: string[] = [];
    public spotifyArtistIds: string[] = [];
    public newgroundsUsernames: string[] = [];
    public soundcloudUsernames: string[] = [];
    public twitterHandles: string[] = [];
    public twitchUsernames: string[] = [];
    public tiktokUsernames: string[] = [];
    public facebookUsernames: string[] = [];
}

/** Object all stat object for a defined profile */
export class VanityPlateProfileStats {
    public id: string = '';
    public displayName: string = '';
    // Account Stats
    public youtubeStats: YoutubeStats[] = [];
    public instaStats: InstagramStats[] = [];
    public threadsStats: ThreadsStats[] = [];
    public spotifyStats: SpotifyStats[] = [];
    public newgroundsStats: NewgroundsStats[] = [];
    public soundcloudStats: SoundCloudStats[] = [];
    public twitterStats: TwitterStats[] = [];
    public twitchStats: TwitchStats[] = [];
    public tiktokStats: TiktokStats[] = [];
    public facebookStats: FacebookStats[] = [];

    public static printAll(profileStats: VanityPlateProfileStats) {
        // Print All Stats
        for (const key of Object.keys(profileStats)) {
            if (!!profileStats[key] && profileStats[key].length > 0) {
                for (const statObj of profileStats[key]) {
                    if (!!statObj?.print) {
                        statObj.print();
                        console.log('-----------');
                    }
                }
            }
        }
    }

    public static getConcatStatsArray(profileStats: VanityPlateProfileStats): ProfileStatsBase[] {
        return [
            ...(profileStats.youtubeStats ?? []),
            ...(profileStats.instaStats ?? []),
            ...(profileStats.newgroundsStats ?? []),
            ...(profileStats.soundcloudStats ?? []),
            ...(profileStats.spotifyStats ?? []),
            ...(profileStats.threadsStats ?? []),
            ...(profileStats.tiktokStats ?? []),
            ...(profileStats.twitchStats ?? []),
            ...(profileStats.twitterStats ?? []),
            ...(profileStats.facebookStats ?? []),
        ];
    }

    public static rawToObject(profileStats: VanityPlateProfileStats): VanityPlateProfileStats {
        profileStats = rawToObject(profileStats, new VanityPlateProfileStats());
        for (let profile of profileStats.youtubeStats) {
            profile = rawToObject(profile, new YoutubeStats());
        }
        for (let profile of profileStats.instaStats) {
            profile = rawToObject(profile, new InstagramStats());
        }
        for (let profile of profileStats.threadsStats) {
            profile = rawToObject(profile, new ThreadsStats());
        }
        for (let profile of profileStats.spotifyStats) {
            profile = rawToObject(profile, new SpotifyStats());
        }
        for (let profile of profileStats.newgroundsStats) {
            profile = rawToObject(profile, new NewgroundsStats());
        }
        for (let profile of profileStats.soundcloudStats) {
            profile = rawToObject(profile, new SoundCloudStats());
        }
        for (let profile of profileStats.twitterStats) {
            profile = rawToObject(profile, new TwitterStats());
        }
        for (let profile of profileStats.twitchStats) {
            profile = rawToObject(profile, new TwitchStats());
        }
        for (let profile of profileStats.tiktokStats) {
            profile = rawToObject(profile, new TiktokStats());
        }
        for (let profile of profileStats.facebookStats) {
            profile = rawToObject(profile, new FacebookStats());
        }
        return profileStats;
    }
}

export class VanityPlateSum {
    /** The defined accounts Vanity-Plate-Social id / username */
    public username: string = '';
    /** The defined accounts name to be displayed */
    public displayName: string = '';
    /** Total number of followers the defined account has across all platforms */
    public totalFollowers: number = 0;
}

export class VanityPlateSumCollection {
    /** List of vanity plate profiles summation indexes */
    public sums: VanityPlateSum[] = [];
    /** Timestamp for when these items were recorded */
    public timeRetrieved: number = 0;
    constructor(sums: VanityPlateSum[]) {
        this.sums = sums.sort((a, b) => (a.displayName.toLowerCase() < b.displayName.toLowerCase() ? -1 : 1));
        this.timeRetrieved = new Date().getTime();
    }
}

/** Get all corresponding stats objects for a profile */
export async function getProfileStats(
    context: BrowserContext,
    profileDef: VanityPlateProfile,
    errCount: number = 0
): Promise<VanityPlateProfileStats> {
    try {
        const profileStats: VanityPlateProfileStats = new VanityPlateProfileStats();
        // Set profile id for later reference
        profileStats.id = profileDef.id;
        // Set profile display name for later reference
        profileStats.displayName = profileDef.displayName;
        // Get stats for all of the profile's YouTube accounts
        if (!!profileDef?.youtubeHandles) {
            profileStats.youtubeStats = await getYoutubeStatsArr(context, profileDef.youtubeHandles);
        }
        // Get stats for all of the profile's Instagram handles
        if (!!profileDef?.instagramHandles) {
            profileStats.instaStats = await getInstagramStatsArr(context, profileDef.instagramHandles);
        }
        // Get stats for all of the profile's Threads usernames
        if (!!profileDef?.threadsHandles) {
            profileStats.threadsStats = await getThreadsStatsArr(context, profileDef.threadsHandles);
        }
        // Get stats for all of the profile's Spotify artist IDs
        if (!!profileDef?.spotifyArtistIds) {
            profileStats.spotifyStats = await getSpotifyStatsArr(context, profileDef.spotifyArtistIds);
        }
        // Get stats for all of the profile's Newgrounds usernames
        if (!!profileDef?.newgroundsUsernames) {
            profileStats.newgroundsStats = await getNewgroundsStatsArr(context, profileDef.newgroundsUsernames);
        }
        // Get stats for all of the profile's SoundCloud usernames
        if (!!profileDef?.soundcloudUsernames) {
            profileStats.soundcloudStats = await getSoundcloudStatsArr(context, profileDef.soundcloudUsernames);
        }
        // Get stats for all of the profile's twitter handles
        if (!!profileDef?.twitterHandles) {
            profileStats.twitterStats = await getTwitterStatsArr(context, profileDef.twitterHandles);
        }
        // Get stats for all of the profile's twitch usernames
        if (!!profileDef?.twitchUsernames) {
            profileStats.twitchStats = await getTwitchStatsArr(context, profileDef.twitchUsernames);
        }
        // Get stats for all of the profile's tik tok usernames
        if (!!profileDef?.tiktokUsernames) {
            profileStats.tiktokStats = await getTikTokStatsArr(context, profileDef.tiktokUsernames);
        }
        // Get stats for all of the profile's facebook usernames
        if (!!profileDef?.facebookUsernames) {
            profileStats.facebookStats = await getFacebookStatsArr(context, profileDef.facebookUsernames);
        }
        return profileStats;
    } catch (err) {
        if (errCount < 5) {
            console.log(
                chalk.yellow(
                    `Encountered issue retrieving stats for profile ${profileDef.displayName} on attempt ${
                        errCount + 1
                    }. Trying again...`
                )
            );
            errCount++;
            return await getProfileStats(context, profileDef, errCount);
        } else {
            console.error(err);
            throw err;
        }
    }
}

export function getProfileStatsSummation(
    username: string,
    displayName: string,
    stats: VanityPlateProfileStats
): VanityPlateSum {
    const sum = new VanityPlateSum();
    sum.username = username;
    sum.displayName = displayName;

    /** Loop over each platforms within the stats object */
    let statKey: keyof VanityPlateProfileStats;
    for (statKey in stats) {
        const accounts = stats[statKey];
        if (typeof accounts !== 'string') {
            /** Loop over each account listed within the platform */
            for (const account of accounts) {
                if (account?.followerCount) {
                    sum.totalFollowers += account.followerCount;
                }
            }
        }
    }

    return sum;
}
