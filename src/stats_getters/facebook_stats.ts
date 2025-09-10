import { BrowserContext, Page } from 'playwright';
import { FacebookStats } from './stats_defs';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import chalk = require('chalk');

/** Get an array of objects containing facebook info and statistics given a browser context and account @'s */
export async function getFacebookStatsArr(context: BrowserContext, handles: string[]): Promise<FacebookStats[]> {
    const stats: FacebookStats[] = [];
    for (const handle of handles) {
        const data = await getFacebookStats(context, handle);
        stats.push(data);
        data.isValid();
    }
    return stats;
}

/** Get an object containing facebook info and statistics given a browser context and account @ */
export async function getFacebookStats(
    context: BrowserContext,
    username: string,
    errCount: number = 0
): Promise<FacebookStats> {
    try {
        const content: string = await getFacebookPageContent(context, username);
        const stats = new FacebookStats();
        stats.timeRetrieved = new Date().getTime();
        stats.link = `https://www.facebook.com/${username}`;
        stats.displayName = getDisplayNameFromContent(content);
        stats.username = username;
        // stats.totalPosts = getPostCountFromContent(content);
        stats.followerCount = getFollowerCountFromContent(content);
        stats.iconUrl = getIconUrlFromContent(content);
        stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);

        return stats;
    } catch (err) {
        if (errCount < 1) {
            console.log(
                chalk.yellow(
                    `Encountered issue retrieving stats for facebook account @${username} on attempt ${
                        errCount + 1
                    }. Trying again...`
                )
            );
            errCount++;
            return await getFacebookStats(context, username, errCount);
        } else {
            console.error(err);
            console.log(
                chalk.red(
                    `Encountered issue retrieving stats for facebook account @${username} on attempt ${
                        errCount + 1
                    }. Returning default instagram object`
                )
            );
            const defaultStats = new FacebookStats();
            defaultStats.link = `https://www.facebook.com/${username}/`;
            defaultStats.username = username;
            return defaultStats;
        }
    }
}

async function getFacebookPageContent(context: BrowserContext, username: string): Promise<string> {
    const page: Page = await createStealthPage(context);
    const baseUrl = 'https://www.facebook.com';
    const url = `https://www.facebook.com/${username}`;
    await stealthNavigate(page, url, 5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getDisplayNameFromContent(content: string): string {
    const regex = /"user":[^{]*{[^{]*"name":[^"]*"[^"]*"/gm;
    const matches = content.match(regex);
    if (!!matches && matches.length > 0) {
        const displayName = matches[0].split('"name":"')[1].split('"')[0].trim();
        return displayName;
    }
    return '';
}

function getFollowerCountFromContent(content: string): number {
    // Look for the JSON structure containing follower count
    const regex = /"text":"([^"]*followers[^"]*)"/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const textMatch = match.match(/"text":"([^"]*followers[^"]*)"/);
            if (textMatch && textMatch[1]) {
                const followerText = textMatch[1];
                // Extract the number part before "followers"
                const numberMatch = followerText.match(/([0-9.]+[KMB]?)\s*followers/i);
                if (numberMatch && numberMatch[1]) {
                    return convertAbbreviateNumberStr(numberMatch[1]);
                }
            }
        }
    }
    return -1;
}

function getIconUrlFromContent(content: string): string {
    const regex = /"profilePicLarge":[^{]*{[^}]*}/gm;
    const matches = content.match(regex);
    if (!!matches && matches.length > 0) {
        const url = matches[0].split('"uri":"')[1].split('"')[0].trim();
        const re = /\\/gm;
        // Remove all instances of '\' from the retrieved string
        const decoded = url.replace(re, '');
        return decoded;
    }
    return '';
}
