import { BrowserContext, Page } from "playwright";
import { convertAbbreviateNumberStr } from "../helper_functions/abbrev_num_convert";
const fs = require('fs') // Built-in filesystem package for Node.j

export class SpotifyStats { 
    timeRetrieved: number = 0;
    link: string = '';
    artistId: string = '';
    displayName: string = '';
    monthlyListeners: number = 0;
    // TODO (?) - Likely requires Spotify API integration
    // followers: number = 0;
    // iconUrl: string = '';
    // iconBase64: string = '';

    public print() { 
        console.log('Spotify [' + this.displayName + '] Info:');
        console.log('Monthly Listeners: ' + this.monthlyListeners);
    }
}

/** Given an array of artist ids, return an array of corresponding spotify stats objects */
export async function getSpotifyStatsArr(context: BrowserContext, artistIds: string[]): Promise<SpotifyStats[]> { 
    const spotifyStats: SpotifyStats[] = [];
    for(const id of artistIds) { 
        const data = await getSpotifyStats(context, id);
        spotifyStats.push(data);
    }
    return spotifyStats;
}

/** Get an object containing info and statistics given a browser context and artist id */
export async function getSpotifyStats(context: BrowserContext, artistId: string): Promise<SpotifyStats> { 
    const content = await getSpotifyPageContent(context, artistId);
    const monthlyListeners = getMonthlyListenersFromPageContents(content);
    const artistName = getArtistNameFromPageContents(content);
    const stats = new SpotifyStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://open.spotify.com/artist/${artistId}`;
    stats.artistId = artistId;
    stats.displayName = artistName;
    stats.monthlyListeners = monthlyListeners;
    return stats;
}

async function getSpotifyPageContent(context: BrowserContext, artistId: string): Promise<string> { 
    const page: Page = await context.newPage();
    const url: string = `https://open.spotify.com/artist/${artistId}`;
    await page.goto(url); 
    const content = await page.content();
    return content;
}
/** Get json data object present in page contents */
function getJsonFromPageContents(htmlContent: string): object { 
    const regex = /<script type="application\/ld+\+json">[^>]*<\/script>/gm;
    const matches = htmlContent.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const json = match.split('json">')[1].split('</')[0];
            const data = JSON.parse(json);
            return data;
        }
    }
    return {};
}
/** Get the monthly listeners count number from the spotify artist's page contents */
function getMonthlyListenersFromPageContents(htmlContent: string): number { 
    try { 
        const data = getJsonFromPageContents(htmlContent);
        const desc = data['description'];
        const abbrevNum = desc.split('monthly listeners')[0].split('·')[1];
        return convertAbbreviateNumberStr(abbrevNum);
    } catch { 
        return 0;
    }
}
/** Get the artist's display name name from the spotify artist's page contents */
function getArtistNameFromPageContents(htmlContent: string): string { 
    try { 
        const data = getJsonFromPageContents(htmlContent);
        return data['name'];
    } catch { 
        return '';
    }
}
