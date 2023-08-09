import { BrowserContext, Page } from "playwright";
import { convertAbbreviateNumberStr } from "./abbrev_num_convert";
import { getBase64ImageFromUrl } from "./base64_url_img_fetch";

export class YtStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = ';'
    totalViews: number = 0;
    subscribers: number = 0;
    iconUrl: string = '';
    iconBas64: string = '';

    public print() { 
        console.log('YouTube ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Views: ' + this.totalViews);
        console.log('Total Subscribers: ' + this.subscribers);
    }
}


/** Get an object containing info and statistics given a browser context and channel @ */
export async function getYoutubeStats(context: BrowserContext, channelHandle: string): Promise<YtStats> { 
    const urlExt: string = `/@${channelHandle}/about`;
    const content: string = await getYoutubePageContent(context, urlExt);
    const channelName: string = getDisplayNameFromPageContent(content);
    const views: number =  getViewsFromPageContent(content);
    const subs: number = getSubsFromPageContent(content);
    const iconUrl: string = getImageUrlFromPageContent(content);
    const iconBase64: string = await getBase64ImageFromUrl(iconUrl);
    const stats = new YtStats();
    stats.link = `https://www.youtube.com/@${channelHandle}/`
    stats.displayName = channelName;
    stats.handle = channelHandle;
    stats.totalViews = views;
    stats.subscribers = subs;
    stats.iconUrl = iconUrl;
    stats.iconBas64 = iconBase64;
    stats.timeRetrieved = new Date().getTime();
    return stats;
}

/** Retrieve the HTML content on a youtube channel page */
async function getYoutubePageContent(context: BrowserContext, urlExtension: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const baseUrl = 'https://www.youtube.com';
    const fullUrl = baseUrl + urlExtension;
    await page.goto(fullUrl); 
    await page.waitForSelector('yt-formatted-string#subscriber-count')
    const content = await page.content();
    return content;
}

/** Given the entire HTML content of a channel's about page, return their total views */
function getViewsFromPageContent(htmlContent: string): number { 
    const regex = /<yt-formatted-string.*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            if(match.toLowerCase().includes('views')) { 
                const viewsTxt: string = match.split('>')[1].split('<')[0];
                const views: number = parseFloat(viewsTxt.split(' ')[0].replace(/,/g, ''));
                return views;
            }
        }
    }
    return -1;
}
/** Given the entire HTML content of a channel's about page, return their total subscribers */
function getSubsFromPageContent(htmlContent: string): number { 
    const multipliers: string[] = ["", "k", "m", "b"]; // subscriber count are abbreviated with at 1K, 1M : use these to multiply back to original values
    const regex = /<yt-formatted-string id="subscriber-count".*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            if(match.toLowerCase().includes('subscribers')) { 
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
    if(!!matches) { 
        for(const match of matches) { 
            const nameTxt: string = match.split('>')[1].split('<')[0];
            return nameTxt;
        }
    }
    return '';
} 
/** Given the entire HTML content of a channel's about page, return their channel avatar image url */
function getImageUrlFromPageContent(htmlContent: string): string { 
    const regex = /<img.*><ytd-channel-avatar-editor.*id="avatar-editor".*>.*<\/ytd-channel-avatar-editor>/gm;
    const matches = htmlContent.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const urlRegex = /src=".*"/gm;
            const urlMatches = match.match(urlRegex);
            if(!!urlMatches && urlMatches?.length > 0) { 
                const imgUrl = urlMatches[0].split('"')[1];
                return imgUrl;
            }
            
        }
    }
    return '';
}

