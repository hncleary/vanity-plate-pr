import chalk = require('chalk');

/** Base class with stats values shared between account platforms */
export class ProfileStatsBase {
    /** Name of the platform the account is associated with */
    public platformName: string = '';
    /** Unix timestamp at which the referenced profile's stats were retrieved */
    public timeRetrieved: number = -1;
    /** The direct link to the account page */
    public link: string = '';
    /** The non-unique display name associated with the account */
    public displayName: string = '';
    /** Unique username / handle used to distinguish the account */
    public username: string = '';
    /** Number of followers that the account has */
    public followerCount: number = -1;
    /** Name for which to refer to followers as (ex. Fans, Subscribers, Listeners) */
    public followerLabel: string = 'Followers';
    /** Number of accounts on the platform that this account is following */
    public followingCount: number = -1;
    /** The current profile picture used by the account in base64 */
    public iconBase64: string = '';
    /** The url at which the user's profile picture image file was found */
    public iconUrl: string = '';
    /** Output main details of the account to console */
    public print() {
        console.log(`${this.platformName} ${this.displayName} Details:`);
        console.log(`Username (@): ${this.username}`);
        console.log(`${this.followerLabel} Count: ${this.followerCount}`);
        if (this.followingCount > 0) {
            console.log(`Following Count: ${this.followingCount}`);
        }
    }
}

/** Stats associated with instagram accounts */
export class InstagramStats extends ProfileStatsBase {
    /** Total number of instagram posts that this account has made */
    public totalPosts: number = -1;
    constructor() {
        super();
        this.platformName = 'Instagram';
    }
    public print() {
        super.print();
        console.log(`Total Posts: ${this.totalPosts}`);
    }
    public isValid(): boolean {
        let isValid = true;
        if (!this.iconBase64) {
            console.log(chalk.yellow(`No instagram icon set in profile (@${this.username})`));
            isValid = false;
        }
        if (this.totalPosts < 0) {
            console.log(chalk.yellow(`No value set for instagram total posts (@${this.username})`));
            isValid = false;
        }
        if (this.followerCount < 0) {
            console.log(chalk.yellow(`No value set for follower count (@${this.username})`));
            isValid = false;
        }
        if (this.followingCount < 0) {
            console.log(chalk.yellow(`No value set for following count (@${this.username})`));
            isValid = false;
        }
        return isValid;
    }
}

/** Stats associated with newgrounds accounts */
export class NewgroundsStats extends ProfileStatsBase {
    // Post Counts
    /** Total number of news posts made by the account */
    public newsCount: number = 0;
    /** Total number of movie projects uploaded by the account */
    public moviesCount: number = 0;
    /** Total number of art posts made by the account */
    public artCount: number = 0;
    /** Total number of audio projects uploaded by the account */
    public audioCount: number = 0;
    /** Total number of game projects uploaded by the account */
    public gamesCount: number = 0;
    // Other Counts
    /** Total number of favorites from the account */
    public favesCount: number = 0;
    /** Total number of reviews the account has posted */
    public reviewsCount: number = 0;
    /** Total number of forum posts the account has made */
    public postsCount: number = 0;
    constructor() {
        super();
        this.platformName = 'Newgrounds';
        this.followerLabel = 'Fans';
    }
    public print() {
        super.print();
        console.log(
            `News: ${this.newsCount}; Movies: ${this.moviesCount}; Art: ${this.artCount}; Audio: ${this.audioCount}; Games: ${this.gamesCount};`
        );
        console.log(`Faves: ${this.favesCount}; Reviews: ${this.reviewsCount}; Posts: ${this.postsCount}; `);
    }
}
/** Stats associated with soundcloud accounts */
export class SoundCloudStats extends ProfileStatsBase {
    /** Total number of audio tracks the account has uploaded */
    public tracks: number = 0;
    constructor() {
        super();
        this.platformName = 'SoundCloud';
    }
    public print() {
        super.print();
        console.log('Tracks: ' + this.tracks);
    }
}
/** Stats associated with spotify accounts */
export class SpotifyStats extends ProfileStatsBase {
    /** The unique artist id referencing the spotify artist account */
    public artistId: string = '';
    constructor() {
        super();
        this.platformName = 'Spotify';
        this.followerLabel = 'Monthly Listeners';
    }
}
/** Stats associated with tiktok accounts */
export class TiktokStats extends ProfileStatsBase {
    /** Total number of likes that the account has received */
    public likes: number = -1;
    constructor() {
        super();
        this.platformName = 'Tik Tok';
    }
}
/** Stats associated with twitch accounts */
export class TwitchStats extends ProfileStatsBase {
    constructor() {
        super();
        this.platformName = 'Twitch';
    }
}
/** Stats associated with twitter accounts */
export class TwitterStats extends ProfileStatsBase {
    /** Total number of tweets that have been posted by the account */
    public totalTweets: number = -1;
    constructor() {
        super();
        this.platformName = 'Twitter';
    }
    public isValid() {
        return (
            this.timeRetrieved > 0 &&
            this.link !== '' &&
            this.username !== '' &&
            this.totalTweets > 0 &&
            this.followerCount > 0 &&
            this.followingCount > 0
        );
    }
}
/** Stats associated with youtube accounts */
export class YoutubeStats extends ProfileStatsBase {
    /** Total count of view for the youtube channel */
    public totalViews: number = 0;
    constructor() {
        super();
        this.platformName = 'YouTube';
        this.followerLabel = 'Subscribers';
    }
}
