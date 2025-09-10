import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import { TiktokStats } from './stats_defs';

export async function getTikTokStatsArr(context: BrowserContext, usernames: string[]): Promise<TiktokStats[]> {
    const stats: TiktokStats[] = [];
    for (const username of usernames) {
        const data = await getTikTokStats(context, username);
        stats.push(data);
    }
    return stats;
}

export async function getTikTokStats(context: BrowserContext, username: string): Promise<TiktokStats> {
    const content = await getPageContent(context, username);
    const stats: TiktokStats = new TiktokStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://www.tiktok.com/@${username}?lang=en`;
    stats.displayName = getDisplayNameFromPageContent(content);
    stats.username = username;
    stats.likes = getLikesCountFromPageContent(content);
    stats.followerCount = getFollowerCountFromPageContent(content);
    stats.followingCount = getFollowingCountFromPageContent(content);
    /** TikTok currently restricts direct access to avatar photo via their src URLs
     * There may be a method within playwright for extracting these images without directly fetching from the URLs
     */
    // TODO - avatar/Icon url
    // TODO - avatar/icon base 64
    return stats;
}

async function getPageContent(context: BrowserContext, username: string): Promise<string> {
    const page: Page = await createStealthPage(context);
    const url = `https://www.tiktok.com/@${username}?lang=en`;
    await stealthNavigate(page, url, 5000);
    const content = await page.content();
    await page.close();
    if (!content) {
        // Alternative: (Works with TikTok, not with most of the other platforms)
        const content = await fetch(url).then((response) => {
            return response.text();
        });
        return content;
    }
    return content;
}

function getDisplayNameFromPageContent(content: string): string {
    const regex = /"user-subtitle"[^<]*<\/h2>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('>')[1].split('<')[0];
            return txt;
        }
    }
    return '';
}

function getFollowerCountFromPageContent(content: string): number {
    const regex = /data-e2e="followers-count">[^<]*</gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('data-e2e="followers-count">').join('').split('<').join('').trim();
            return convertAbbreviateNumberStr(txt);
        }
    }
    return 0;
}

function getFollowingCountFromPageContent(content: string): number {
    const regex = /data-e2e="following-count">[^<]*</gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('data-e2e="following-count">').join('').split('<').join('').trim();
            return convertAbbreviateNumberStr(txt);
        }
    }
    return 0;
}

function getLikesCountFromPageContent(content: string): number {
    const regex = /data-e2e="likes-count">[^<]*</gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('data-e2e="likes-count">').join('').split('<').join('').trim();
            return convertAbbreviateNumberStr(txt);
        }
    }
    return 0;
}
