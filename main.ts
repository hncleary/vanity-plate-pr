import { BrowserContext, Page } from "playwright";
import { getYoutubeStats, YtStats } from "./youtube_stats";
const fs = require('fs') // Built-in filesystem package for Node.j


const { chromium } = require('playwright');
(async () => { 
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 
    // Navigate to a website - and then do something

    const handlesToFetch: string[] = ['Google', 'MrBeast', 'Smosh', 'Cyranek'];
    // const handlesToFetch: string[] = ['Cyranek', 'Cyrakek', 'StaticStudio_', 'CyranekDelta', 'MasterSheesh', 'Avalon_'];
    // const handlesToFetch: string[] = ['Cyranek'];
    const statsList: YtStats[] = [];
    for(const handle of handlesToFetch) { 
        
        const stats = await getYoutubeStats(context, handle);
        stats.print();
        console.log('----------------');
        statsList.push(stats);
    }

    // Stringify retrieved data, then save to .json format
    const data = JSON.stringify(statsList);
    fs.writeFile('output.json', data, (err) => {
        if (err) throw err;
    })

    // TODO
    // [ ] youtube
    // [ ] tik tok
    // [ ] instagram
    // [ ] twitter
    // [ ] soundcloud 
    // [ ] spotify
    // [ ] newgrounds
    // [ ] threads (?)
    // 

    // Close the headless browser
    await browser.close(); 
})();



async function sleep(s: number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
 }