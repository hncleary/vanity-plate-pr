import { BrowserContext, Page } from 'playwright';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import { SoundCloudStats } from './stats_defs';

export async function getSoundcloudStatsArr(context: BrowserContext, usernames: string[]): Promise<SoundCloudStats[]> {
    const soundcloudStats: SoundCloudStats[] = [];
    for (const handle of usernames) {
        const data = await getSoundcloudStats(context, handle);
        soundcloudStats.push(data);
    }
    return soundcloudStats;
}

/** Get an object containing info and statistics for a soundcloud profile given a browser context and username */
export async function getSoundcloudStats(context: BrowserContext, username: string): Promise<SoundCloudStats> {
    const content: string = await getSoundCloudPageContent(context, username);
    const stats = new SoundCloudStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://soundcloud.com/${username}`;
    stats.displayName = getDisplayNameFromContent(content);
    stats.username = username;
    stats.followerCount = getFollowersFromContent(content);
    stats.followingCount = getFollowingFromContent(content);
    stats.tracks = getTrackCountFromContent(content);
    stats.iconUrl = getProfileImgUrlFromContent(content);
    stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);
    return stats;
}

async function getSoundCloudPageContent(context: BrowserContext, username: string) {
    const page: Page = await createStealthPage(context);
    const url = `https://soundcloud.com/${username}`;
    await stealthNavigate(page, url, 5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getDisplayNameFromContent(content: string): string {
    const regex = /<span class="soundTitle__usernameText">(.|\n)*<\/span>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const nameTxt: string = match.split('>')[1].split('<')[0];
            return nameTxt.trim();
        }
    }
    return '';
}
function getProfileImgUrlFromContent(content: string): string {
    const regex = /<span style="background-image: url\(&quot;(.|\n)*&quot/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const item: string = match.split('&quot;')[1];
            return item.trim();
        }
    }
    return '';
}
function getFollowersFromContent(content: string): number {
    const regex =
        /<a href="\/.*\/followers" rel="nofollow" class="infoStats__statLink sc-link-light sc-link-primary" title=".* followers">/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt: string = match.split('title="')[1].split('followers"')[0];
            return Number(txt.trim().split(',').join(''));
        }
    }
    return 0;
}
function getFollowingFromContent(content: string): number {
    const regex =
        /<a href="\/.*\/following" rel="nofollow" class="infoStats__statLink sc-link-light sc-link-primary" title="Following.*people">/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt: string = match.split('title="Following')[1].split('people"')[0];
            return Number(txt.trim().split(',').join(''));
        }
    }
    return 0;
}
function getTrackCountFromContent(content: string): number {
    const regex =
        /<a href="\/.*\/tracks" rel="nofollow" class="infoStats__statLink sc-link-light sc-link-primary" title=".*tracks">/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt: string = match.split('title="')[1].split('tracks"')[0];
            return Number(txt.trim().split(',').join(''));
        }
    }
    return 0;
}
