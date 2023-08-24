import { BrowserContext, Page } from "playwright";
import { convertAbbreviateNumberStr } from "../helper_functions/abbrev_num_convert";

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
    // Other Counts
    favesCount: number = 0;
    reviewsCount: number = 0;
    postsCount: number = 0;

    public print() { 
        console.log('Newgrounds ' + this.displayName + ' Info:');
        console.log('Fans: ' + this.fans);
        console.log(`News: ${this.newsCount}; Movies: ${this.moviesCount}; Art: ${this.artCount}; Audio: ${this.audioCount}; Games: ${this.gamesCount};`);
        console.log(`Faves: ${this.favesCount}; Reviews: ${this.reviewsCount}; Posts: ${this.postsCount}; `);
    }
}

/** Given an array of newgrounds account usernames, return an array of corresponding newgrounds stats objects */
export async function getNewgroundsStatsArr(context: BrowserContext, usernames: string[]): Promise<NewgroundsStats[]> { 
    const newgroundsStats: NewgroundsStats[] = [];
    for(const name of usernames) { 
        const data = await getNewgroundsStats(context, name);
        newgroundsStats.push(data);
    }
    return newgroundsStats;
}

export async function getNewgroundsStats(context: BrowserContext, username: string): Promise<NewgroundsStats> { 
    const content: string = await getNewgroundsPageContent(context, username);
    const counts: Map<string, number> = getPostCountsFromPageContent(content);
    const stats = new NewgroundsStats();
    const fansCount = getExactFansFromPageContent(content);
    const displayName = getDisplayNameFromPageContent(content);
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://${username}.newgrounds.com/fans`;
    stats.displayName = displayName;
    stats.username = username;
    stats.fans = fansCount;
    stats.newsCount = counts.get('NEWS') ?? 0;
    stats.moviesCount = counts.get('MOVIES') ?? 0;
    stats.artCount = counts.get('ART') ?? 0;
    stats.audioCount = counts.get('AUDIO') ?? 0;
    stats.gamesCount = counts.get('GAMES') ?? 0;
    stats.favesCount = counts.get('FAVES') ?? 0;
    stats.reviewsCount = counts.get('REVIEWS') ?? 0;
    stats.postsCount = counts.get('POSTS') ?? 0;
    return stats;
}

/** Retrieve the HTML content on a newgrounds user page */
async function getNewgroundsPageContent(context: BrowserContext, username: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const url = `https://${username}.newgrounds.com/fans`
    await page.goto(url); 
    const content = await page.content();
    return content;
}

/** Given the HTML page content of a user's page, determine their fan count */
function getExactFansFromPageContent(content: string): number { 
    const regex = /<div class="pod">[^>]*<div class="pod-head">[^>]*<h2>[^>]*<\/h2>/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const count = match.split('<h2>')[1].split('</h2>')[0].trim().split(' ')[1];
            if(!!count) { 
                return Number(count.split(',').join(''));
            }
        }
    }
    return -1;
}

function getDisplayNameFromPageContent(content: string): string { 
    const regex = /<div class="pod">[^>]*<div class="pod-head">[^>]*<h2>[^>]*<\/h2>/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const name = match.split('<h2>')[1].split('</h2>')[0].trim().split(' ')[0];
            if(!!name) { 
                return name.split('\'')[0];
            }
        }
    }
    return '';
}

/** Given the HTML page content of a user's page, determine their fan count */
function getPostCountsFromPageContent(content: string): Map<string, number> { 
    const regex = /<span>.*<\/span>[^>]*<strong>[^>]*<\/strong>/gm;
    const matches = content.match(regex);
    const counts: Map<string, number> = new Map<string, number>();
    if(!!matches) { 
        for(const match of matches) { 
            const name = match.split('<span>')[1].split('</span>')[0];
            const count = match.split('<strong>')[1].split('</strong>')[0];
            counts.set(name, Number(convertAbbreviateNumberStr(count)))
        }
    }
    return counts;
}