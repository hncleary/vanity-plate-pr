import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';

export class TikTokStats {
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = '';
    likes: number = 0;
    followerCount: number = 0;
    followingCount: number = 0;
    iconUrl: string = '';
    iconBase64: string = '';

    public print() {
        console.log('TikTok ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Followers: ' + this.followerCount);
        console.log('Total Following: ' + this.followingCount);
        console.log('Total Likes Received: ' + this.likes);
    }
}

export async function getTikTokStatsArr(context: BrowserContext, usernames: string[]): Promise<TikTokStats[]> {
    const stats: TikTokStats[] = [];
    for (const username of usernames) {
        const data = await getTikTokStats(context, username);
        stats.push(data);
    }
    return stats;
}

export async function getTikTokStats(context: BrowserContext, username: string): Promise<TikTokStats> {
    const content = await getPageContent(context, username);
    const stats: TikTokStats = new TikTokStats();
    // TODO - pull stats data from page content
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://www.tiktok.com/@${username}?lang=en`;
    stats.displayName = getDisplayNameFromPageContent(content);
    stats.handle = username;
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
    const page: Page = await context.newPage();
    const url = `https://www.tiktok.com/@${username}?lang=en`;
    await page.goto(url);
    await page.waitForTimeout(5000);
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
    const regex = /<title>.*TikTok<\/title>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('<title>').join('').split('| TikTok</title>').join('').trim().split('(@')[0].trim();
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
