import { BrowserContext, Page, chromium } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { systemHasDisplay } from '../helper_functions/has_display';
import { TwitterStats } from './stats_defs';

export async function getTwitterStatsArr(context: BrowserContext, handles: string[]): Promise<TwitterStats[]> {
    const stats: TwitterStats[] = [];
    for (const handle of handles) {
        let data: TwitterStats;
        data = await getTwitterStats(context, handle);
        // If data is not valid, retry getting stats for the user with a headful browser on nitter.net
        if (!data.isValid()) {
            const hasDisplay = await systemHasDisplay();
            console.log('System Has Display: ' + hasDisplay);
            if (hasDisplay) {
                const headfulBrowser = await chromium.launch({ headless: false });
                const headfulContext: BrowserContext = await headfulBrowser.newContext({
                    userAgent:
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' +
                        ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                });
                data = await getNitterStats(headfulContext, handle);
                headfulBrowser.close();
            }
        }
        stats.push(data);
    }
    return stats;
}

export async function getTwitterStats(context: BrowserContext, handle: string): Promise<TwitterStats> {
    const content = await getPageContent(context, handle);
    const stats: TwitterStats = new TwitterStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://twitter.com/${handle}`;
    stats.displayName = getDisplayNameFromContent(content);
    stats.username = handle;
    stats.totalTweets = getPostsFromContent(content);
    stats.followerCount = getFollowersFromContent(content);
    stats.followingCount = getFollowingFromContent(content);
    stats.iconUrl = getImgUrlFromContent(content);
    stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);
    return stats;
}

async function getPageContent(context: BrowserContext, handle: string): Promise<string> {
    const page: Page = await context.newPage();
    const url = `https://twitter.com/${handle}`;
    await page.goto(url);
    await page.waitForTimeout(5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getFollowersFromContent(content: string): number {
    const regex = /followers"(.|\n)*Followers<\/span><\/span><\/a>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('</span></span>')[0].split('>');
            const numTxt = txt[txt.length - 1];
            return convertAbbreviateNumberStr(numTxt);
        }
    }
    return -1;
}

function getFollowingFromContent(content: string): number {
    const regex = /following"(.|\n)*Following<\/span><\/span><\/a>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('</span></span>')[0].split('>');
            const numTxt = txt[txt.length - 1];
            return convertAbbreviateNumberStr(numTxt);
        }
    }
    return -1;
}

function getPostsFromContent(content: string): number {
    const regex = />[^\s]* posts<\/div>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const numTxt = match.split('>').join('').split('posts</div').join('').trim();
            return convertAbbreviateNumberStr(numTxt);
        }
    }
    return -1;
}

function getDisplayNameFromContent(content: string): string {
    const regex = /"givenName":[^,]*"[^,]*",/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const name = match.split('"givenName":"').join('').split('",').join('');
            return name;
        }
    }
    return '';
}

function getImgUrlFromContent(content: string): string {
    const regex = /https:\/\/[^<]*\/profile_images\/[^<]*200x200.jpg/gm;
    const matches = content.match(regex);
    if (!!matches) {
        return matches[0];
    }
    return '';
    // TODO - add regex check for users that may have legacy .gif profile icons if this return is not truthy
}

export async function getNitterStats(context: BrowserContext, handle: string): Promise<TwitterStats> {
    // https://nitter.net/cyranek
    const content = await getNitterPageContent(context, handle);
    const stats: TwitterStats = new TwitterStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://twitter.com/${handle}`;
    stats.displayName = getDisplayNameFromNitterContent(content);
    stats.username = handle;
    stats.totalTweets = getPostsFromNitterContent(content);
    stats.followerCount = getFollowersFromNitterContent(content);
    stats.followingCount = getFollowingFromNitterContent(content);
    stats.iconUrl = getImgUrlFromNitterContent(content);
    stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);
    return stats;
}

async function getNitterPageContent(context: BrowserContext, handle: string): Promise<string> {
    const page: Page = await context.newPage();
    const url = `https://nitter.net/${handle}`;
    await page.goto(url);
    await page.waitForTimeout(2000);
    const content = await page.content();
    await page.close();
    return content;
}
function getDisplayNameFromNitterContent(content: string): string {
    const regex = /<a class="profile-card-fullname" href="[^<]*" title="[^<]*">[^<]*</gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txt = match.split('>')[1].split('<')[0];
            return txt;
        }
    }
    return '';
}
function getPostsFromNitterContent(content: string): number {
    const regex = /<span class="profile-stat-header">Tweets<\/span>[^<]*<span class="profile-stat-num">[^<]*/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txtarr = match.split('>');
            let num = txtarr[txtarr.length - 1];
            num = num.split(',').join('');
            return Number(num);
        }
    }
    return -1;
}
function getFollowersFromNitterContent(content: string): number {
    const regex = /<span class="profile-stat-header">Followers<\/span>[^<]*<span class="profile-stat-num">[^<]*/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txtarr = match.split('>');
            let num = txtarr[txtarr.length - 1];
            num = num.split(',').join('');
            return Number(num);
        }
    }
    return -1;
}
function getFollowingFromNitterContent(content: string): number {
    const regex = /<span class="profile-stat-header">Following<\/span>[^<]*<span class="profile-stat-num">[^<]*/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const txtarr = match.split('>');
            return Number(txtarr[txtarr.length - 1]);
        }
    }
    return -1;
}
function getImgUrlFromNitterContent(content: string): string {
    const regex = /<a class="profile-card-avatar"[^<]*<[^<]*<\/a>/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const imgSrc = match.split('src="')[1].split('"')[0];
            return `https://nitter.net${imgSrc}`;
        }
    }
    return '';
}
