import chalk = require('chalk');
import {
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
import { VanityPlateProfileStats } from './profile_data';

export function mergeStats(
    oldStats: VanityPlateProfileStats,
    newStats: VanityPlateProfileStats
): VanityPlateProfileStats {
    console.log(`Merging against existing stats for ${newStats.id}`);
    // Construct return account stats object
    let returnStats: VanityPlateProfileStats = new VanityPlateProfileStats();
    returnStats.displayName = newStats.displayName;
    returnStats.id = newStats.id;
    // Iterate over every profile in the new account stats object
    const profiles: ProfileStatsBase[] = VanityPlateProfileStats.getConcatStatsArray(newStats);
    for (let profile of profiles) {
        const matchingOldProfile: ProfileStatsBase | undefined = findMatchingOldStatsProfileObject(profile, oldStats);
        if (!!matchingOldProfile) {
            profile = mergeProfile(matchingOldProfile, profile);
        }
        returnStats = setProfileToStatsObject(profile, returnStats);
    }
    return returnStats;
}

function setProfileToStatsObject(
    profile: ProfileStatsBase,
    statsAccount: VanityPlateProfileStats
): VanityPlateProfileStats {
    const returnAccount = structuredClone(statsAccount);
    switch (profile.platformName) {
        case 'Instagram':
            returnAccount.instaStats.push(profile as InstagramStats);
            break;
        case 'Threads':
            returnAccount.threadsStats.push(profile as ThreadsStats);
            break;
        case 'Newgrounds':
            returnAccount.newgroundsStats.push(profile as NewgroundsStats);
            break;
        case 'SoundCloud':
            returnAccount.soundcloudStats.push(profile as SoundCloudStats);
            break;
        case 'Spotify':
            returnAccount.spotifyStats.push(profile as SpotifyStats);
            break;
        case 'Tik Tok':
            returnAccount.tiktokStats.push(profile as TiktokStats);
            break;
        case 'Twitch':
            returnAccount.twitchStats.push(profile as TwitchStats);
            break;
        case 'Twitter':
            returnAccount.twitterStats.push(profile as TwitterStats);
            break;
        case 'YouTube':
            returnAccount.youtubeStats.push(profile as YoutubeStats);
            break;
    }
    return returnAccount;
}

function findMatchingOldStatsProfileObject(
    newProfile: ProfileStatsBase,
    oldStats: VanityPlateProfileStats
): ProfileStatsBase | undefined {
    const oldProfiles: ProfileStatsBase[] = VanityPlateProfileStats.getConcatStatsArray(oldStats);
    const f = oldProfiles.find((p) => p.platformName === newProfile.platformName && p.username === newProfile.username);
    return f;
}

function mergeProfile(oldProfile: ProfileStatsBase, newProfile: ProfileStatsBase): ProfileStatsBase {
    if (!ProfileStatsBase.isValid(newProfile)) {
        if (ProfileStatsBase.isValid(newProfile)) {
            // Return the old profile stats if the new profile is not valid and old profile is
            console.log(
                chalk.blue(
                    `Invalid stats object for @${newProfile?.username} on ${newProfile?.platformName} - using found old stats object`
                )
            );
            return oldProfile;
        } else {
            console.log(
                chalk.blue(
                    `Invalid stats object for @${newProfile?.username} on ${newProfile?.platformName} - no previous valid object found`
                )
            );
            return newProfile;
        }
    }

    // Construct return profile stats object
    const profileReturn: ProfileStatsBase = structuredClone(newProfile);

    // Default to the last valid profile icon
    const validIconBase64 = !!newProfile.iconBase64;
    if (!validIconBase64) {
        console.log(
            chalk.blue(`Fell back to old base64 icon for @${newProfile?.username} on ${newProfile?.platformName}`)
        );
        profileReturn.iconBase64 = oldProfile?.iconBase64 ?? '';
        profileReturn.iconUrl = oldProfile?.iconBase64 ?? '';
    }

    return profileReturn;
}
