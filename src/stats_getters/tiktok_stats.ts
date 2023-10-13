import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';

export class TikTokStats {
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = '';
    totalPosts: number = 0;
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

export async function getTikTokStats(context: BrowserContext, handle: string): Promise<TikTokStats> {
    const content = await getPageContent(context, handle);
    const stats: TikTokStats = new TikTokStats();

    // TODO - pull stats data from page content

    return stats;
}

async function getPageContent(context: BrowserContext, username: string): Promise<string> {
    const page: Page = await context.newPage();
    const url = `https://www.tiktok.com/${username}?lang=en`;
    await page.goto(url);
    await page.waitForTimeout(5000);
    const content = await page.content();
    await page.close();
    return content;
}
