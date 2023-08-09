import { BrowserContext, Page } from "playwright";
import { convertAbbreviateNumberStr } from "./abbrev_num_convert";
const fs = require('fs') // Built-in filesystem package for Node.j

export class InstagramStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';'
    totalPosts: number = 0;
    followerCount: number = 0;
    followingCount: number = 0;
    iconBase64: string = '';

    public print() { 
        console.log('Instagram ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Followers: ' + this.followerCount);
        console.log('Total Following: ' + this.followingCount);
        console.log('Total Posts: ' + this.totalPosts);
    }
}

export async function getInstagramStats(context: BrowserContext, handle: string): Promise<InstagramStats> { 
    const urlExt = `/${handle}`;
    const content: string = await getInstagramPageContent(context, urlExt);
    fs.writeFile('insta-content.txt', content, (err) => {
        if (err) throw err;
    })

    const followers = getFollowersFromContent(content);
    const following = getFollowingFromContent(content);
    const postCount = getPostCountFromContent(content);
    const displayName = getDisplayNameFromContent(content, handle);
    const iconUrl = getImageUrlFromPageContent(content);
    const iconBase64 = '';

    const stats =  new InstagramStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://www.instagram.com/${handle}`
    stats.displayName = displayName;
    stats.handle = handle;
    stats.totalPosts = postCount;
    stats.followerCount = followers;
    stats.followingCount = following;
    stats.iconBase64 = iconBase64;
    return stats;
}

async function getInstagramPageContent(context: BrowserContext, urlExtension: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const baseUrl = 'https://www.instagram.com';
    const fullUrl = baseUrl + urlExtension;
    await page.goto(fullUrl); 
    // Find selector to await if issues arise with this part of the code (?)
    // await page.waitForSelector('yt-formatted-string#subscriber-count')
    await page.waitForTimeout(5000);
    const content = await page.content();
    fs.writeFile('instagram_page.html', content, (err) => {
        if (err) throw err;
    })
    return content;
}
/** Given the entire HTML content of a user's instagram page, return the description containing much of the needed user information*/
function getDescriptionFromContent(content: string): string { 
    const regex = /<meta\n*[ ]*property="og:description" content="[^>]*">/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        return matches[0];
    }
    return '';
}
/** Given the entire HTML content of a user's instagram page, return their follower count */
function getFollowersFromContent(content: string): number { 
    const descLine = getDescriptionFromContent(content);
    const abbrevNumStr = descLine.split('content="')[1].split('Followers')[0];
    return convertAbbreviateNumberStr(abbrevNumStr);
}
/** Given the entire HTML content of a user's instagram page, return their following count */
function getFollowingFromContent(content: string): number { 
    const descLine = getDescriptionFromContent(content);
    const abbrevNumStr = descLine.split('Followers,')[1].split('Following')[0];
    return convertAbbreviateNumberStr(abbrevNumStr);
}
/** Given the entire HTML content of a user's instagram page, return their post count */
function getPostCountFromContent(content: string): number { 
    const descLine = getDescriptionFromContent(content);
    const abbrevNumStr = descLine.split('Following,')[1].split('Posts')[0];
    return convertAbbreviateNumberStr(abbrevNumStr);
}
/** Given the entire HTML content of a user's instagram page, return their display name */
function getDisplayNameFromContent(content: string, handle: string): string { 
    const descLine = getDescriptionFromContent(content);
    const handleSplitter = `(@${handle})`;
    return descLine.split('from ')[1].split(handleSplitter)[0].split(' ').join('');
}

/** Given an entire page of HTML content - not currently in use for instagram stats */
function getBase64ImageFromContent(content: string): string[] { 
    const regex = /src="(data:image\/[^;]+;base64[^"]+)"/gm;
    const matches = content.match(regex);
    console.log(matches);
    const base64Imgs: string[] = [];
    if(!!matches) { 
        for(const match of matches) { 
            const base64 = match.split('src="')[1].split('"')[0].split(' ').join('');;
            base64Imgs.push(base64);
        }
    }
    return base64Imgs;
}

function getImageUrlFromPageContent(htmlContent: string): string { 
    const regex = /<img/gm;
    return '';
}