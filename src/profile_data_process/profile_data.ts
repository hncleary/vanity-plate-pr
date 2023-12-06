import { BrowserContext } from 'playwright';
import { InstagramStats, getInstagramStatsArr } from '../stats_getters/instagram_stats';
import { NewgroundsStats, getNewgroundsStatsArr } from '../stats_getters/newgrounds_stats';
import { SpotifyStats, getSpotifyStatsArr } from '../stats_getters/spotify_stats';
import { YtStats, getYoutubeStatsArr } from '../stats_getters/youtube_stats';
import { SoundCloudStats, getSoundcloudStatsArr } from '../stats_getters/soundcloud_stats';
import { TwitterStats, getTwitterStatsArr } from '../stats_getters/twitter_stats';
import { TwitchStats, getTwitchStatsArr } from '../stats_getters/twitch_stats';
import { TikTokStats, getTikTokStatsArr } from '../stats_getters/tiktok_stats';

/** Profile definition defining lists of social identifiers */
export class VanityPlateProfile {
    public id: string = '';
    public displayName: string = '';
    // Account Lists
    public youtubeHandles: string[] = [];
    public instagramHandles: string[] = [];
    public spotifyArtistIds: string[] = [];
    public newgroundsUsernames: string[] = [];
    public soundcloudUsernames: string[] = [];
    public twitterHandles: string[] = [];
    public twitchUsernames: string[] = [];
    public tiktokUsernames: string[] = [];
}

/** Object all stat object for a defined profile */
export class VanityPlateProfileStats {
    public id: string = '';
    public displayName: string = '';
    // Account Stats
    public youtubeStats: YtStats[] = [];
    public instaStats: InstagramStats[] = [];
    public spotifyStats: SpotifyStats[] = [];
    public newgroundsStats: NewgroundsStats[] = [];
    public soundcloudStats: SoundCloudStats[] = [];
    public twitterStats: TwitterStats[] = [];
    public twitchStats: TwitchStats[] = [];
    public tiktokStats: TikTokStats[] = [];

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
    profileDef: VanityPlateProfile
): Promise<VanityPlateProfileStats> {
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

    return profileStats;
}

export function getProfileStatsSummation(
    username: string,
    displayName: string,
    stats: VanityPlateProfileStats
): VanityPlateSum {
    const sum = new VanityPlateSum();
    sum.username = username;
    sum.displayName = displayName;
    /** Loop over each available youtube account */
    for (const yt of stats.youtubeStats) {
        sum.totalFollowers += yt.subscribers;
    }
    /** Loop over each available instagram account */
    for (const insta of stats.instaStats) {
        sum.totalFollowers += insta.followerCount;
    }
    /** Loop over each available spotify account */
    for (const spoofy of stats.spotifyStats) {
        sum.totalFollowers += spoofy.monthlyListeners;
    }
    /** Loop over each available newgrounds account */
    for (const ng of stats.newgroundsStats) {
        sum.totalFollowers += ng.fans;
    }
    /** Loop over each available soundcloud account */
    for (const sc of stats.soundcloudStats) {
        sum.totalFollowers += sc.followers;
    }
    /** Loop over each available twitter account */
    for (const twitter of stats.twitterStats) {
        sum.totalFollowers += twitter.followerCount;
    }
    /** Loop over each available twitch account */
    for (const twitch of stats.twitchStats) {
        sum.totalFollowers += twitch.followers;
    }
    /** Loop over each available tiktok account */
    for (const tt of stats.tiktokStats) {
        sum.totalFollowers += tt.followerCount;
    }
    return sum;
}
