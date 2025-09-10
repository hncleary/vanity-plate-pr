import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import { NewgroundsStats } from './stats_defs';

/** Given an array of newgrounds account usernames, return an array of corresponding newgrounds stats objects */
export async function getNewgroundsStatsArr(context: BrowserContext, usernames: string[]): Promise<NewgroundsStats[]> {
    const newgroundsStats: NewgroundsStats[] = [];
    for (const name of usernames) {
        const data = await getNewgroundsStats(context, name);
        newgroundsStats.push(data);
    }
    return newgroundsStats;
}

export async function getNewgroundsStats(context: BrowserContext, username: string): Promise<NewgroundsStats> {
    const content: string = await getNewgroundsPageContent(context, username);
    const counts: Map<string, number> = getPostCountsFromPageContent(content);
    const stats = new NewgroundsStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://${username}.newgrounds.com/fans`;
    stats.displayName = getDisplayNameFromPageContent(content);
    stats.username = username;
    stats.followerCount = getFansFromPageContent(content);
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
    const page: Page = await createStealthPage(context);
    const url = `https://${username}.newgrounds.com/fans`;
    await stealthNavigate(page, url, 3000);
    const content = await page.content();
    await page.close();
    return content;
}

/** Given the HTML page content of a user's page, determine their fan count */
function getFansFromPageContent(content: string): number {
    const regex = /<span>FANS<\/span>\s*<strong>([^<]+)<\/strong>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const countMatch = match.match(/<strong>([^<]+)<\/strong>/);
            if (countMatch && countMatch[1]) {
                const countStr = countMatch[1].trim();
                return convertAbbreviateNumberStr(countStr);
            }
        }
    }
    return -1;
}

function getDisplayNameFromPageContent(content: string): string {
    const regex = /<div class="pod">[^>]*<div class="pod-head">[^>]*<h2>[^>]*<\/h2>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const name = match.split('<h2>')[1].split('</h2>')[0].trim().split(' ')[0];
            if (!!name) {
                return name.split("'")[0];
            }
        }
    }
    return '';
}

/** Given the HTML page content of a user's page, determine their post counts */
function getPostCountsFromPageContent(content: string): Map<string, number> {
    const regex = /<span>.*<\/span>[^>]*<strong>[^>]*<\/strong>/gm;
    const matches = content.match(regex);
    const counts: Map<string, number> = new Map<string, number>();
    if (!!matches) {
        for (const match of matches) {
            const name = match.split('<span>')[1].split('</span>')[0];
            const count = match.split('<strong>')[1].split('</strong>')[0];
            counts.set(name, Number(convertAbbreviateNumberStr(count)));
        }
    }
    return counts;
}
