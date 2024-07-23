import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';
import { YoutubeStats } from './stats_defs';
import { getBase64AspectRatio } from '../helper_functions/base64_aspect_ratio';

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
    stats.username = channelHandle;
    stats.totalViews = getViewsFromPageContent(content);
    stats.followerCount = getSubsFromPageContent(content);
    stats.iconUrl = await getImageUrlFromPageContent(content);
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
    await page.waitForTimeout(3000);
    const content = await page.content();
    await page.close();
    return content;
}

/** Given the entire HTML content of a channel's about page, return their total views */
function getViewsFromPageContent(htmlContent: string): number {
    const regex = /<td[^<]*class="style-scope[^<]*ytd-about-channel-renderer">[^<]*<\/td>/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            if (match.toLowerCase().includes('views')) {
                const txt: string = match.split('>')[1].split('<')[0];
                const numTxt = txt.split(' ')[0].split(',').join('');
                return parseFloat(numTxt);
            }
        }
    }
    return -1;
}
/** Given the entire HTML content of a channel's about page, return their total subscribers */
function getSubsFromPageContent(htmlContent: string): number {
    const regex = /<td[^<]*class="style-scope[^<]*ytd-about-channel-renderer">[^<]*<\/td>/gm;
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
    const regex = /{"urlCanonical":"[^"]*","title":"[^"]*"/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const items: string[] = match.split('"').filter((item) => !!item);
            return items[items.length - 1];
        }
    }
    return '';
}
/** Given the entire HTML content of a channel's about page, return their channel avatar image url */
async function getImageUrlFromPageContent(htmlContent: string): Promise<string> {
    try {
        const imgRegex = /src="https:\/\/yt3.ggpht.com[^>]*"/gm;
        let imgMatches = htmlContent.match(imgRegex);
        if (!imgMatches || imgMatches.length === 0) {
            const backupimgRegex = /src="https:\/\/yt3[^>]*"/gm;
            imgMatches = htmlContent.match(backupimgRegex);
        }
        const urls = imgMatches?.map((match) => match.split('"')[1]) ?? [];
        return await processImageUrls(urls);
    } catch (e) {
        console.error('Unable to get image url from page', e);
    }
    return '';
}

/** Given a list of image urls, determine which one has a 1:1 ratio and return it
 * @NOTE this is used to return a profile image rather than something like a channel banner
 */
async function processImageUrls(urls: string[]): Promise<string> {
    for (const url of urls) {
        const base64 = await getBase64ImageFromUrl(url);
        const ratio = getBase64AspectRatio(base64);
        if (ratio === 1) {
            return url;
        }
    }
    return '';
}
