import { BrowserContext } from "playwright";
import { InstagramStats, getInstagramStatsArr } from "../stats_getters/instagram_stats";
import { NewgroundsStats, getNewgroundsStatsArr } from "../stats_getters/newgrounds_stats";
import { SpotifyStats, getSpotifyStatsArr } from "../stats_getters/spotify_stats";
import { YtStats, getYoutubeStatsArr } from "../stats_getters/youtube_stats";

/** Profile definition defining lists of social identifiers */
export class VanityPlateProfile {
    public id: string = '';
    public displayName: string = '';
    // Account Lists
    public youtubeHandles: string[] = [];
    public instagramHandles: string[] = [];
    public spotifyArtistIds: string[] = [];
    public newgroundsUsernames: string[] = [];
}

/** Object all stat object for a defined profile */
export class VanityPlateProfileStats { 
    public youtubeStats: YtStats[] = [];
    public instaStats: InstagramStats[] = [];
    public spotifyStats: SpotifyStats[] = [];
    public newgroundsStats: NewgroundsStats[] = []
}

/** Get all corresponding stats objects for a profile */
export async function getProfileStats(context: BrowserContext, profileDef: VanityPlateProfile): Promise<VanityPlateProfileStats> {
    const profileStats: VanityPlateProfileStats = new VanityPlateProfileStats();
    // Get stats for all of the profile's youtube accounts
    profileStats.youtubeStats = await getYoutubeStatsArr(context, profileDef.youtubeHandles);
    // Get stats for all of the profile's instagram handles
    profileStats.instaStats = await getInstagramStatsArr(context, profileDef.instagramHandles);
    // Get stats for all of the profile's spotify artist IDs
    profileStats.spotifyStats = await getSpotifyStatsArr(context, profileDef.spotifyArtistIds);
    // Get stats for all of the profile's newgrounds usernames
    profileStats.newgroundsStats = await getNewgroundsStatsArr(context, profileDef.newgroundsUsernames);
    return  profileStats;
}