import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import { TwitchStats } from './stats_defs';

export async function getTwitchStatsArr(context: BrowserContext, handles: string[]): Promise<TwitchStats[]> {
    const stats: TwitchStats[] = [];
    for (const handle of handles) {
        const data = await getTwitchStats(context, handle);
        stats.push(data);
    }
    return stats;
}

export async function getTwitchStats(context: BrowserContext, username: string): Promise<TwitchStats> {
    const content = await getPageContent(context, username);
    const stats: TwitchStats = new TwitchStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://www.twitch.tv/${username}`;
    stats.displayName = getDisplayNameFromContent(content);
    stats.username = username;
    stats.followerCount = getFollowersFromContent(content);
    stats.iconUrl = getIconUrlFromContent(content);
    stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);
    return stats;
}

async function getPageContent(context: BrowserContext, username: string): Promise<string> {
    const page: Page = await createStealthPage(context);
    const url = `https://www.twitch.tv/${username}`;
    await stealthNavigate(page, url, 5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getFollowersFromContent(content: string): number {
    const regex = />[^\s]* followers<\/p>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const numTxt = match.split('>').join('').split('followers</p').join('').trim();
            return convertAbbreviateNumberStr(numTxt);
        }
    }
    return 0;
}

function getDisplayNameFromContent(content: string): string {
    const regex = /<title>.* - Twitch<\/title>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('<title>').join('').split('- Twitch</title>').join('').trim();
            return txt;
        }
    }
    return '';
}

function getIconUrlFromContent(content: string): string {
    const regex = /<meta[^>]*content="https:\/\/static-cdn.jtvnw.net\/jtv_user_pictures[^>]*300x300.png/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('content="')[1].trim();
            return txt;
        }
    }
    return '';
}
