import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';

export class InstagramStats {
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';';
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

/** Get an array of objects containing instagram info and statistics given a browser context and account @'s */
export async function getInstagramStatsArr(context: BrowserContext, handles: string[]): Promise<InstagramStats[]> {
    const instagramStats: InstagramStats[] = [];
    for (const handle of handles) {
        const data = await getInstagramStats(context, handle);
        instagramStats.push(data);
    }
    return instagramStats;
}

/** Get an object containing instagram info and statistics given a browser context and account @ */
export async function getInstagramStats(context: BrowserContext, handle: string): Promise<InstagramStats> {
    const urlExt = `/${handle}`;
    const content: string = await getInstagramPageContent(context, urlExt);

    const followers: number = getFollowersFromContent(content);
    const following: number = getFollowingFromContent(content);
    const postCount: number = getPostCountFromContent(content);
    const displayName: string = getDisplayNameFromContent(content, handle);
    const iconUrl: string = getImageUrlFromPageContent(content);

    let iconBase64: string = '';
    try {
        iconBase64 = await getBase64ImageFromUrl(iconUrl);
    } catch {
        console.error('Unable to fetch image from ' + iconUrl);
    }

    const stats = new InstagramStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://www.instagram.com/${handle}`;
    stats.displayName = displayName;
    stats.handle = handle;
    stats.totalPosts = postCount;
    stats.followerCount = followers;
    stats.followingCount = following;
    stats.iconBase64 = iconBase64;
    return stats;
}

/** Retrieve the HTML content on a instagram account page */
async function getInstagramPageContent(context: BrowserContext, urlExtension: string): Promise<string> {
    const page: Page = await context.newPage();
    const baseUrl = 'https://www.instagram.com';
    const fullUrl = baseUrl + urlExtension;
    await page.goto(fullUrl);
    // Find selector to await if issues arise with this part of the code (?)
    // await page.waitForSelector('main')
    await page.waitForTimeout(5000);
    const content = await page.content();
    await page.close();
    return content;
}
/** Given the entire HTML content of a user's instagram page, return the description containing much of the needed user information*/
function getDescriptionFromContent(content: string): string {
    try {
        const regex = /<meta\n*[ ]*property="og:description" content="[^>]*">/gm;
        const matches = content.match(regex);
        if (!!matches) {
            return matches[0];
        }
    } catch {
        console.error('unable to get description from content');
        console.log(content);
    }
    return '';
}
/** Given the entire HTML content of a user's instagram page, return their follower count */
function getFollowersFromContent(content: string): number {
    try {
        const descLine = getDescriptionFromContent(content);
        const abbrevNumStr = descLine.split('content="')[1].split('Followers')[0];
        return convertAbbreviateNumberStr(abbrevNumStr);
    } catch {
        console.error('unable to get number from content');
        console.log(content);
    }
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
/** Given the entire HTML content of a user's instagram page, return the url for their profile image */
function getImageUrlFromPageContent(htmlContent: string): string {
    const regex = /<img alt=".*'s profile picture".*">/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const urlRegex = /src=".*"/gm;
            const urlMatches = match.match(urlRegex);
            if (!!urlMatches && urlMatches?.length > 0) {
                const imgUrl = urlMatches[0].split('"')[1].split('amp;').join('');
                return imgUrl;
            }
        }
    }
    return '';
}

/** Given an entire page of HTML content - not currently in use for instagram stats */
// function getBase64ImageFromContent(content: string): string[] {
//     const regex = /src="(data:image\/[^;]+;base64[^"]+)"/gm;
//     const matches = content.match(regex);
//     console.log(matches);
//     const base64Imgs: string[] = [];
//     if(!!matches) {
//         for(const match of matches) {
//             const base64 = match.split('src="')[1].split('"')[0].split(' ').join('');;
//             base64Imgs.push(base64);
//         }
//     }
//     return base64Imgs;
// }
