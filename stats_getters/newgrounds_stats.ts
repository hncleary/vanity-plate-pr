import { BrowserContext } from "playwright";

export class NewgroundsStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    username: string = '';
    fans: number = 0;
    // Post Counts
    newsCount: number = 0;
    moviesCount: number = 0;
    artCount: number = 0;
    audioCount: number = 0;
    gamesCount: number = 0;

    public print() { 
        console.log('Newgrounds ' + this.displayName + ' Info:');
        console.log('Fans: ' + this.fans);
        console.log(`News: ${this.newsCount}; Movies: ${this.moviesCount}; Art: ${this.artCount}; Audio: ${this.audioCount}; Games: ${this.gamesCount}`);
    }
}

export async function getNewgroundsStats(context: BrowserContext, handle: string): Promise<NewgroundsStats> { 

    const stats = new NewgroundsStats();
    return stats;
}