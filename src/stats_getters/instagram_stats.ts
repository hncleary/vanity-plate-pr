import { BrowserContext, Page, chromium } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import chalk = require('chalk');
import { InstagramStats } from './stats_defs';

/** Get an array of objects containing instagram info and statistics given a browser context and account @'s */
export async function getInstagramStatsArr(context: BrowserContext, handles: string[]): Promise<InstagramStats[]> {
    const instagramStats: InstagramStats[] = [];
    for (const handle of handles) {
        const data = await getInstagramStats(context, handle);
        instagramStats.push(data);
        data.isValid();
    }
    return instagramStats;
}

/** Get an object containing instagram info and statistics given a browser context and account @ */
export async function getInstagramStats(
    context: BrowserContext,
    handle: string,
    errCount: number = 0
): Promise<InstagramStats> {
    try {
        const urlExt = `/${handle}`;
        const content: string = await getInstagramPageContent(context, urlExt);

        const iconUrl: string = getImageUrlFromPageContent(content);
        let iconBase64: string = '';
        try {
            iconBase64 = await getBase64ImageFromUrl(iconUrl);
        } catch {
            console.error(chalk.yellow('Unable to fetch image from ' + iconUrl));
        }

        const stats = new InstagramStats();
        stats.timeRetrieved = new Date().getTime();
        stats.link = `https://www.instagram.com/${handle}`;
        stats.displayName = getDisplayNameFromContent(content, handle);
        stats.username = handle;
        stats.totalPosts = getPostCountFromContent(content);
        stats.followerCount = getFollowersFromContent(content);
        stats.followingCount = getFollowingFromContent(content);
        stats.iconBase64 = iconBase64;
        return stats;
    } catch (err) {
        if (errCount < 1) {
            console.log(
                chalk.yellow(
                    `Encountered issue retrieving stats for instagram account @${handle} on attempt ${
                        errCount + 1
                    }. Trying again...`
                )
            );
            errCount++;
            return await getInstagramStats(context, handle, errCount);
        } else {
            console.error(err);
            console.log(
                chalk.red(
                    `Encountered issue retrieving stats for instagram account @${handle} on attempt ${
                        errCount + 1
                    }. Returning default instagram object`
                )
            );
            const instaDefault = new InstagramStats();
            instaDefault.link = `https://www.instagram.com/${handle}`;
            instaDefault.username = handle;
            return instaDefault;
        }
    }
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
    let handleSplitter = `(@${handle})`;
    if (!descLine.includes(handleSplitter)) {
        return handle;
    }
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
