import { BrowserContext } from "playwright";

export class SoundCloudStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';'
    followers: number = 0;
    iconUrl: string = '';
    iconBas64: string = '';
    //
    totalPlays: number = 0;
    tracks: number = 0;

    public print() { 
        console.log('YouTube ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Plays: ' + this.totalPlays);
        console.log('Total Followers: ' + this.followers);
    }
}

/** Get an object containing info and statistics given a browser context and channel @ */
export async function getYoutubeStats(context: BrowserContext, username: string): Promise<SoundCloudStats> { 
    // TODO
    const stats = new SoundCloudStats();
    // TODO
    return stats;
}