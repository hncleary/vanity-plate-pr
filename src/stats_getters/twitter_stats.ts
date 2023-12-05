import { BrowserContext, Page } from 'playwright';
import { writeHtmlToFile } from '../helper_functions/def_files';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';

export class TwitterStats {
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';';
    totalTweets: number = 0;
    followerCount: number = 0;
    followingCount: number = 0;
    iconUrl: string = '';
    iconBase64: string = '';

    public print() {
        console.log('Twitter ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Followers: ' + this.followerCount);
        console.log('Total Following: ' + this.followingCount);
        console.log('Total Tweets: ' + this.totalTweets);
    }
}

export const USE_NITTER = true;

export async function getTwitterStatsArr(context: BrowserContext, handles: string[]): Promise<TwitterStats[]> {
    const stats: TwitterStats[] = [];
    for (const handle of handles) {
        let data: TwitterStats;
        if (!USE_NITTER) {
            data = await getTwitterStats(context, handle);
        } else {
            data = await getNitterStats(context, handle);
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
    stats.handle = handle;
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
    return 0;
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
    return 0;
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
    return 0;
}

function getDisplayNameFromContent(content: string): string {
    const regex = /"givenName": ".*",/gm;
    const matches = content.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const name = match.split('"givenName": "').join('').split('",').join('');
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
    stats.handle = handle;
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
    await writeHtmlToFile('nitter', content);
    await page.close();
    return content;
}
function getDisplayNameFromNitterContent(content: string): string {
    const regex = /<a class="profile-card-fullname" href="[^<]*" title="[^<]*">[^<]*</gm;
    const matches = content.match(regex);
    console.log(matches);
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
