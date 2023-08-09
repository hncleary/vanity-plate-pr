import { BrowserContext, Page } from "playwright";
import { getYoutubeStats, YtStats } from "./stats_getters/youtube_stats";
import { getInstagramStats, InstagramStats } from "./stats_getters/instagram_stats";
const fs = require('fs') // Built-in filesystem package for Node.j


const { chromium } = require('playwright');
(async () => { 
    // Launch playwright browser
    const browser = await chromium.launch(); 
    // Set user agent to prevent web scrape detection
    const context: BrowserContext = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' + ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' }); 

    // const handlesToFetch: string[] = ['Google', 'MrBeast', 'Smosh', 'Cyranek'];
    // const handlesToFetch: string[] = ['Cyranek', 'Cyrakek', 'StaticStudio_', 'CyranekDelta', 'MasterSheesh', 'Avalon_'];
    
    /** YouTube Stats Getter Test */
    const youTubeHandlesToFetch: string[] = ['Cyranek'];
    const youtubeStatsList: YtStats[] = [];
    for(const handle of youTubeHandlesToFetch) { 
        const ytStats = await getYoutubeStats(context, handle);
        ytStats.print();
        console.log('----------------');
        youtubeStatsList.push(ytStats);
    }

    // // Stringify retrieved data, then save to .json format
    // const data = JSON.stringify(youtubeStatsList);
    // fs.writeFile('output.json', data, (err) => {
    //     if (err) throw err;
    // })

    /** Instagram Stats Getter Test */
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
    // [x] Instagram
    // [ ] Twitter
    // [ ] SoundCloud 
    // [ ] Spotify
    // [ ] Newgrounds
    // [ ] Threads (?)
    // [ ] Twitch
    // [ ] DeviantArt (?)
    // [ ] Tumblr (?)
    
    // TODO - Create additional repo for angular site
    // TODO - Create additional repo for data storage
    // TODO - Create folder system for multiple vanity pages
    // TODO - Create custom license plate generator

    // Close the headless browser
    await browser.close(); 
})();
