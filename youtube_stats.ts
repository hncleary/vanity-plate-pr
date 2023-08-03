import { BrowserContext, Page } from "playwright";

export class YtStats { 
    channelName: string = '';
    channelHandle: string = ';'
    channelViews: number = 0;
    channelSubs: number = 0;
    channelIconUrl: string = '';
    channelIcon: string = '';

    public print() { 
        console.log(this.channelName + ' Info:');
        console.log('Handle (@): ' + this.channelHandle);
        console.log('Total Views: ' + this.channelViews);
        console.log('Total Subscribers: ' + this.channelSubs);
    }
}


/** Get an object containing info and statistics given a browser context and channel @ */
export async function getYoutubeStats(context: BrowserContext, channelHandle: string) { 
    const urlExt: string = `/@${channelHandle}/about`;
    const content: string = await getYoutubePageContent(context, urlExt);
    const channelName: string = getDisplayNameFromPageContent(content);
    const views: number =  getViewsFromPageContent(content);
    const subs: number = getSubsFromPageContent(content);
    const iconUrl: string = getImageUrlFromPageContent(content);
    const iconBase64: string = await getBase64ImageFromUrl(iconUrl);
    const stats = new YtStats();
    stats.channelName = channelName;
    stats.channelHandle = channelHandle;
    stats.channelViews = views;
    stats.channelSubs = subs;
    stats.channelIconUrl = iconUrl;
    stats.channelIcon = iconBase64;
    return stats;
}


async function getYoutubePageContent(context: BrowserContext, urlExtension: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const baseUrl = 'https://www.youtube.com';
    const fullUrl = baseUrl + urlExtension;
    await page.goto(fullUrl); 
    await page.waitForSelector('yt-formatted-string#subscriber-count')
    const content = await page.content();
    return content;
}

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

function getSubsFromPageContent(htmlContent: string) { 
    const multipliers: string[] = ["", "k", "m", "b"]; // subscriber count are abbreviated with at 1K, 1M : use these to multiply back to original values
    const regex = /<yt-formatted-string id="subscriber-count".*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            if(match.toLowerCase().includes('subscribers')) { 
                const subsTxt: string = match.split('>')[1].split('<')[0];
                const subsNumTxt = subsTxt.split(' ')[0]
                const subs: number = parseFloat(subsNumTxt.replace(/,/g, ''));
                let subMult = '';
                if(subsNumTxt.split(subs.toString()).length > 1) { 
                    subMult = subsNumTxt.split(subs.toString())[1].toLowerCase();
                }
                const multiplierFactor = 1000**multipliers.indexOf(subMult); // 1000 to the power of the index of the multiplier n*1000^0, n**1000^1, n*1000^2
                return subs * multiplierFactor;
            }
        }
    }
    return -1;
}

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

export async function getBase64ImageFromUrl(imgUrl: string): Promise<string> { 
    const fetchImageUrl = await fetch(imgUrl);
    const responseArrBuffer = await fetchImageUrl.arrayBuffer();
    const toBase64 = `data:${ fetchImageUrl.headers.get('Content-Type') || 'image/png' };base64,${Buffer.from(responseArrBuffer).toString('base64')}`;
    return toBase64;
}
