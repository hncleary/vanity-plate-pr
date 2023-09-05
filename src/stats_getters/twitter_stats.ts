import { BrowserContext, Page } from "playwright";
import { writeHtmlToFile } from "../helper_functions/def_files";
import { convertAbbreviateNumberStr } from "../helper_functions/abbrev_num_convert";

export class TwitterStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';'
    totalTweets: number = 0;
    followerCount: number = 0;
    followingCount: number = 0;
    iconUrl: string = '';
    iconBase64: string = '';

    public print() { 
        console.log('Twitter ' + this.displayName + ' Info:');
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
    const content = await getPageContent(context, handle);
    await writeHtmlToFile('twitter', content);
    const followerCount: number = getFollowersFromContent(content);
    const followingCount: number = getFollowingFromContent(content);
    const tweetCount:  number = getPostsFromContent(content);
    const stats: TwitterStats = new TwitterStats;
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://twitter.com/${handle}`;
    // TODO - display name
    stats.handle = handle;
    stats.totalTweets = tweetCount;
    stats.followerCount = followerCount;
    stats.followingCount = followingCount;
    // TODO - icon url
    // TODO - icon base64
    return stats;
}

async function getPageContent(context: BrowserContext, handle: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const url = `https://twitter.com/${handle}`;
    await page.goto(url); 
    await page.waitForTimeout(5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getFollowersFromContent(content: string): number { 
    const regex = /followers"(.|\n)*Followers<\/span><\/span><\/a>/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const txt = match.split('</span></span>')[0].split('>');
            const numTxt = txt[txt.length - 1];
            return convertAbbreviateNumberStr(numTxt)
        }
    }
    return 0;
}

function getFollowingFromContent(content: string): number { 
    const regex = /following"(.|\n)*Following<\/span><\/span><\/a>/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const txt = match.split('</span></span>')[0].split('>');
            const numTxt = txt[txt.length - 1];
            return convertAbbreviateNumberStr(numTxt)
        }
    }
    return 0;
}


function getPostsFromContent(content: string): number { 
    const regex = />[^\s]* posts<\/div>/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const numTxt = match.split('>').join('').split('posts</div').join('').trim();
            return convertAbbreviateNumberStr(numTxt);
        }
    }
    return 0;
}