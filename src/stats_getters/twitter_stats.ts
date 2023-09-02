import { BrowserContext, Page } from "playwright";
import { writeHtmlToFile } from "../helper_functions/def_files";

export class TwitterStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';'
    totalTweets: number = 0;
    followerCount: number = 0;
    followingCount: number = 0;
    iconBase64: string = '';

    public print() { 
        console.log('Instagram ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Followers: ' + this.followerCount);
        console.log('Total Following: ' + this.followingCount);
        console.log('Total Tweets: ' + this.totalTweets);
    }
}

export async function getTwitterStatsArr(context: BrowserContext, handles: string[]): Promise<TwitterStats[]> { 
    const stats: TwitterStats[] = [];
    for(const handle of handles) { 
        const data = await getTwitterStats(context, handle);
        stats.push(data);
    }
    return stats;
}

export async function getTwitterStats(context: BrowserContext, handle: string): Promise<TwitterStats> { 
    // TODO
    const content = await getPageContent(context, handle);
    // await writeHtmlToFile('twitter', content);

    const stats: TwitterStats = new TwitterStats;
    
    return stats;
}

async function getPageContent(context: BrowserContext, handle: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const url = `https://twitter.com/${handle}`
    await page.goto(url); 
    await page.waitForTimeout(5000);
    const content = await page.content();
    await page.close();
    return content;
}