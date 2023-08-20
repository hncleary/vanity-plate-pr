import { BrowserContext, Page } from "playwright";
const fs = require('fs') // Built-in filesystem package for Node.j

export class NewgroundsStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    username: string = '';
    fans: number = 0;
    // Post Counts
    newsCount: number = 0;
    moviesCount: number = 0;
    artCount: number = 0;
    audioCount: number = 0;
    gamesCount: number = 0;

    public print() { 
        console.log('Newgrounds ' + this.displayName + ' Info:');
        console.log('Fans: ' + this.fans);
        console.log(`News: ${this.newsCount}; Movies: ${this.moviesCount}; Art: ${this.artCount}; Audio: ${this.audioCount}; Games: ${this.gamesCount}`);
    }
}

export async function getNewgroundsStats(context: BrowserContext, username: string): Promise<NewgroundsStats> { 
    const content: string = await getNewgroundsPageContent(context, username);
    const stats = new NewgroundsStats();
    return stats;
}

/** Retrieve the HTML content on a newgrounds user page */
async function getNewgroundsPageContent(context: BrowserContext, username: string): Promise<string> { 
    const page: Page = await context.newPage(); 
    const url = `https://${username}.newgrounds.com/fans`
    await page.goto(url); 
    const content = await page.content();
    fs.writeFile('newgrounds.html', content, (err) => {
        if (err) throw err;
    })
    return content;
}

/** Given the HTML page content of a user's page, determine their fan count */
function getFansFromPageContent(content: string) { 
    
}