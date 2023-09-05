import { BrowserContext, Page } from "playwright";
import { writeHtmlToFile } from "../helper_functions/def_files";
import { convertAbbreviateNumberStr } from "../helper_functions/abbrev_num_convert";
import { getBase64ImageFromUrl } from "../helper_functions/base64_url_img_fetch";

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
    const stats: TwitterStats = new TwitterStats;
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://twitter.com/${handle}`;
    stats.displayName = getDisplayNameFromContent(content);
    stats.handle = handle;
    stats.totalTweets = getPostsFromContent(content);
    stats.followerCount = getFollowersFromContent(content);
    stats.followingCount = getFollowingFromContent(content);
    stats.iconUrl = getImgUrlFromContent(content);
    stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);
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

function getDisplayNameFromContent(content: string): string { 
    const regex = /"givenName": ".*",/gm
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const name = match.split('"givenName": "').join('').split('",').join('');
            return name;
        }
    }
    return '';
}

function getImgUrlFromContent(content: string): string { 
    const regex = /https:\/\/[^<]*\/profile_images\/[^<]*200x200.jpg/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        return matches[0];
    }
    return '';
    // TODO - add regex check for users that may have legacy .gif profile icons if this return is not truthy
}