import { BrowserContext, Page } from 'playwright';
import { ThreadsStats } from './stats_defs';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import chalk = require('chalk');

/** Get an array of objects containing threads info and statistics given a browser context and account @'s */
export async function getThreadsStatsArr(context: BrowserContext, usernames: string[]): Promise<ThreadsStats[]> {
    const threadsStats: ThreadsStats[] = [];
    for (const username of usernames) {
        const data = await getThreadsStats(context, username);
        threadsStats.push(data);
        data.isValid();
    }
    return threadsStats;
}

/** Get an object containing threads info and statistics given a browser context and account @ */
export async function getThreadsStats(context: BrowserContext, username: string): Promise<ThreadsStats> {
    const stats = new ThreadsStats();
    const url = `https://www.threads.net/@${username}`;
    const content = await getThreadsPageContent(context, url);
    stats.link = url;
    stats.displayName = getDisplayNameFromContent(content, username);
    stats.followerCount = getFollowerCountFromContent(content);
    stats.username = username;
    stats.timeRetrieved = new Date().getTime();
    const iconUrl: string = getImgUrlFromContent(content, username);
    let iconBase64: string = '';
    try {
        iconBase64 = await getBase64ImageFromUrl(iconUrl);
        stats.iconUrl = iconUrl;
        stats.iconBase64 = iconBase64;
    } catch {
        console.error(chalk.yellow('Unable to fetch image from ' + iconUrl));
    }
    return stats;
}

/** Retrieve the HTML content on a threads account page */
async function getThreadsPageContent(context: BrowserContext, url: string) {
    const page: Page = await createStealthPage(context);
    await stealthNavigate(page, url, 5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getDisplayNameFromContent(content: string, username: string): string {
    const regex = /<meta property="og:title" content="[^<]*>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('content="')[1].split(`(@${username})`)[0].trim();
            return txt;
        }
    }
    return '';
}

function getFollowerCountFromContent(content: string): number {
    const regex = /<meta name="description" content="[^<]*>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const c = match.split('content="')[1].split(`Followers`)[0].trim().split(' ');
            const txt = c[c.length - 1];
            const count = convertAbbreviateNumberStr(txt);
            return count;
        }
    }
    return -1;
}

function getImgUrlFromContent(content: string, username: string): string {
    const regex = /<img[^<]*alt="[^<]*'s profile picture"[^<]*">/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            if (match.includes(`${username}'s profile picture`)) {
                const urlRegex = /src=".*"/gm;
                const urlMatches = match.match(urlRegex);
                if (!!urlMatches && urlMatches?.length > 0) {
                    const imgUrl = urlMatches[0].split('"')[1].split('amp;').join('');
                    return imgUrl;
                }
            }
        }
    }
    return '';
}
