import { BrowserContext, Page } from "playwright";
import { getYoutubeStats, YtStats } from "./youtube_stats";
import { getInstagramStats, InstagramStats } from "./instagram_stats";
const fs = require('fs') // Built-in filesystem package for Node.j


const { chromium } = require('playwright');
(async () => { 
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 
    // Navigate to a website - and then do something

    // const handlesToFetch: string[] = ['Google', 'MrBeast', 'Smosh', 'Cyranek'];
    // const handlesToFetch: string[] = ['Cyranek', 'Cyrakek', 'StaticStudio_', 'CyranekDelta', 'MasterSheesh', 'Avalon_'];
    
    // const youTubeHandlesToFetch: string[] = ['Cyranek'];
    // const youtubeStatsList: YtStats[] = [];
    // for(const handle of youTubeHandlesToFetch) { 
    //     const ytStats = await getYoutubeStats(context, handle);
    //     ytStats.print();
    //     console.log('----------------');
    //     youtubeStatsList.push(ytStats);
    // }

    // // Stringify retrieved data, then save to .json format
    // const data = JSON.stringify(youtubeStatsList);
    // fs.writeFile('output.json', data, (err) => {
    //     if (err) throw err;
    // })

    
    const instaHandlesToFetch: string[] = ['cyranek_'];
    const instaStatsList: InstagramStats[] = [];
    for(const handle of instaHandlesToFetch) { 
        const instaStats: InstagramStats = await getInstagramStats(context, handle);
        instaStats.print();
        console.log('----------------');
        instaStatsList.push(instaStats);
    }

    // TODO
    // [x] YouTube
    // [ ] Tik Tok
    // [ ] Instagram
    // [ ] Twitter
    // [ ] SoundCloud 
    // [ ] Spotify
    // [ ] Newgrounds
    // [ ] Threads (?)
    // [ ] Twitch
    // [ ] DeviantArt (?)
    // [ ] Tumblr (?)
    
    // TODO - Add last time updated
    // TODO - Create folder system for multiple vanity pages
    // TODO - Create custom license plate generator

    // Close the headless browser
    await browser.close(); 
})();



async function sleep(s: number) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
 }