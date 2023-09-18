import { BrowserContext } from 'playwright';
import { InstagramStats, getInstagramStatsArr } from '../stats_getters/instagram_stats';
import { NewgroundsStats, getNewgroundsStatsArr } from '../stats_getters/newgrounds_stats';
import { SpotifyStats, getSpotifyStatsArr } from '../stats_getters/spotify_stats';
import { YtStats, getYoutubeStatsArr } from '../stats_getters/youtube_stats';
import { SoundCloudStats, getSoundcloudStatsArr } from '../stats_getters/soundcloud_stats';
import { TwitterStats, getTwitterStatsArr } from '../stats_getters/twitter_stats';
import { TwitchStats, getTwitchStatsArr } from '../stats_getters/twitch_stats';

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
}

/** Object all stat object for a defined profile */
export class VanityPlateProfileStats {
    public youtubeStats: YtStats[] = [];
    public instaStats: InstagramStats[] = [];
    public spotifyStats: SpotifyStats[] = [];
    public newgroundsStats: NewgroundsStats[] = [];
    public soundcloudStats: SoundCloudStats[] = [];
    public twitterStats: TwitterStats[] = [];
    public twitchStats: TwitchStats[] = [];

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

/** Get all corresponding stats objects for a profile */
export async function getProfileStats(
    context: BrowserContext,
    profileDef: VanityPlateProfile
): Promise<VanityPlateProfileStats> {
    const profileStats: VanityPlateProfileStats = new VanityPlateProfileStats();
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

    return profileStats;
}
