import { BrowserContext } from "playwright";

export class SpotifyStats { 
    timeRetrieved: number = 0;
    displayName: string = '';
    monthlyListeners: string = '';
    followers: string = '';
    iconUrl: string = '';
    iconBase64: string = '';

    public print() { 
        console.log('Spotify ' + this.displayName + ' Info:');
        console.log('Monthly Listeners: ' + this.monthlyListeners);
        console.log('Total Followers: ' + this.followers);
    }
}

export async function getSpotifyStats(context: BrowserContext, artistName: string): Promise<SpotifyStats> { 
    const stats = new SpotifyStats();

    return stats;
}