import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { YoutubeStats } from './stats_defs';

/** Given an array of channel handles, return an array of corresponding youtube stats objects */
export async function getYoutubeStatsArr(context: BrowserContext, channelHandles: string[]): Promise<YoutubeStats[]> {
    const youtubeStats: YoutubeStats[] = [];
    for (const handle of channelHandles) {
        const data = await getYoutubeStats(context, handle);
        youtubeStats.push(data);
    }
    return youtubeStats;
}

/** Get an object containing info and statistics given a browser context and channel @ */
export async function getYoutubeStats(context: BrowserContext, channelHandle: string): Promise<YoutubeStats> {
    const urlExt: string = `/@${channelHandle}/about`;
    const content: string = await getYoutubePageContent(context, urlExt);

    const stats = new YoutubeStats();
    stats.link = `https://www.youtube.com/@${channelHandle}/`;
    stats.displayName = getDisplayNameFromPageContent(content);
    stats.username = getDisplayNameFromPageContent(content);
    stats.totalViews = getViewsFromPageContent(content);
    stats.followerCount = getSubsFromPageContent(content);
    stats.iconUrl = getImageUrlFromPageContent(content);
    stats.iconBase64 = await getBase64ImageFromUrl(stats.iconUrl);
    stats.timeRetrieved = new Date().getTime();
    return stats;
}

/** Retrieve the HTML content on a youtube channel page */
async function getYoutubePageContent(context: BrowserContext, urlExtension: string): Promise<string> {
    const page: Page = await context.newPage();
    const baseUrl = 'https://www.youtube.com';
    const fullUrl = baseUrl + urlExtension;
    await page.goto(fullUrl);
    await page.waitForSelector('yt-formatted-string#subscriber-count');
    const content = await page.content();
    await page.close();
    return content;
}

/** Given the entire HTML content of a channel's about page, return their total views */
function getViewsFromPageContent(htmlContent: string): number {
    const regex = /viewCountText[^{]*joinedDateText/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            if (match.toLowerCase().includes('views')) {
                const viewsTxt: string = match.split(':"')[1].split('views"')[0];
                const views: number = parseFloat(viewsTxt.split(' ')[0].replace(/,/g, ''));
                return views;
            }
        }
    }
    return -1;
}
/** Given the entire HTML content of a channel's about page, return their total subscribers */
function getSubsFromPageContent(htmlContent: string): number {
    const regex = /<yt-formatted-string id="subscriber-count".*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            if (match.toLowerCase().includes('subscribers')) {
                const subsTxt: string = match.split('>')[1].split('<')[0];
                const subsNumTxt = subsTxt.split(' ')[0];
                return convertAbbreviateNumberStr(subsNumTxt);
            }
        }
    }
    return -1;
}
/** Given the entire HTML content of a channel's about page, return their channel display name */
function getDisplayNameFromPageContent(htmlContent: string): string {
    const regex = /<yt-formatted-string.*ytd-channel-name.*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const nameTxt: string = match.split('>')[1].split('<')[0];
            return nameTxt;
        }
    }
    return '';
}
/** Given the entire HTML content of a channel's about page, return their channel avatar image url */
function getImageUrlFromPageContent(htmlContent: string): string {
    try {
        const regex = /<img.*><ytd-channel-avatar-editor.*id="avatar-editor".*>.*<\/ytd-channel-avatar-editor>/gm;
        const matches = htmlContent.match(regex);
        if (!!matches) {
            for (const match of matches) {
                const urlRegex = /src=".*"/gm;
                const urlMatches: RegExpMatchArray = match.match(urlRegex);
                if (!!urlMatches && urlMatches?.length > 0) {
                    const imgUrl = urlMatches[0].split('"')[1];
                    return imgUrl;
                }
            }
        }
    } catch (e) {
        console.error('Unable to get image url from page', e);
    }
    return '';
}
