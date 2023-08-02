import { BrowserContext, Page } from "playwright";

const { chromium } = require('playwright');
(async () => { 
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 
    // Navigate to a website - and then do something

    const handlesToFetch: string[] = ['Google', 'MrBeast', 'Smosh', 'Cyranek', 'Cyrakek', 'StaticStudio_'];
    for(const handle of handlesToFetch) { 
        
        const stats = await getYoutubeStats(context, handle);
        stats.print();
        console.log('----------------');
        // await sleep(30);
    }

    // youtube
    // tik tok
    // instagram
    // twitter
    // soundcloud 
    // spotify
    // newgrounds
    // threads (?)
    // 


    // Close the headless browser
    await browser.close(); 
})();

export class YtStats { 
    channelName: string = '';
    channelHandle: string = ';'
    channelViews: number = 0;
    channelSubs: number = 0;
    // channelIcon: string = ''; // TODO

    public print() { 
        console.log(this.channelName + ' Info:');
        console.log('Handle (@): ' + this.channelHandle);
        console.log('Total Views: ' + this.channelViews);
        console.log('Total Subscribers: ' + this.channelSubs);
    }
}

async function getYoutubeStats(context: BrowserContext, channelHandle: string) { 
    const urlExt: string = `/@${channelHandle}/about`;
    const content: string = await getYoutubePageContent(context, urlExt);
    const channelName: string = getDisplayNameFromPageContent(content);
    const views: number =  getViewsFromPageContent(content);
    const subs: number = getSubsFromPageContent(content);

    const stats = new YtStats();
    stats.channelName = channelName;
    stats.channelHandle = channelHandle;
    stats.channelViews = views;
    stats.channelSubs = subs;
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
    const testRegex = /<yt-formatted-string.*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(testRegex);
    if(!!matches) { 
        for(let match of matches) { 
            if(match.toLowerCase().includes('views')) { 
                const viewsTxt: string = match.split('>')[1].split('<')[0];
                const views: number = parseFloat(viewsTxt.split(' ')[0].replace(/,/g, ''));
                return views;
            }
        }
    }
    console.log(htmlContent);
    return -1;
}

function getSubsFromPageContent(htmlContent: string) { 
    const multipliers: string[] = ["", "k", "m", "b"]; // subscriber count are abbreviated with at 1K, 1M : use these to multiply back to original values
    const testRegex = /<yt-formatted-string id="subscriber-count".*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(testRegex);
    if(!!matches) { 
        for(let match of matches) { 
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
    console.log(htmlContent);
    return -1;
}

function getDisplayNameFromPageContent(htmlContent: string): string {
    const testRegex = /<yt-formatted-string.*ytd-channel-name.*<\/yt-formatted-string>/gm;
    const matches = htmlContent.match(testRegex);
    if(!!matches) { 
        for(let match of matches) { 
            const nameTxt: string = match.split('>')[1].split('<')[0];
            console.log(nameTxt);
            return nameTxt;
        }
    }
    console.log('NOT FOUND');
    return '';
} 

async function sleep(s: number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
 }