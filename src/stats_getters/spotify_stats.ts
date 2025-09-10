import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { createStealthPage, stealthNavigate } from '../helper_functions/stealth_browser';
import { SpotifyStats } from './stats_defs';
const fs = require('fs'); // Built-in filesystem package for Node.j

/** Given an array of artist ids, return an array of corresponding spotify stats objects */
export async function getSpotifyStatsArr(context: BrowserContext, artistIds: string[]): Promise<SpotifyStats[]> {
    const spotifyStats: SpotifyStats[] = [];
    for (const id of artistIds) {
        const data = await getSpotifyStats(context, id);
        spotifyStats.push(data);
    }
    return spotifyStats;
}

/** Get an object containing info and statistics given a browser context and artist id */
export async function getSpotifyStats(context: BrowserContext, artistId: string): Promise<SpotifyStats> {
    // Try the enhanced approach first
    const enhancedStats = await getSpotifyStatsEnhanced(context, artistId);
    if (enhancedStats.followerCount > 0 && enhancedStats.displayName) {
        return enhancedStats;
    }

    // Fallback to the original approach
    const content = await getSpotifyPageContent(context, artistId);
    const monthlyListeners = getMonthlyListenersFromPageContents(content);
    const artistName = getArtistNameFromPageContents(content);
    const stats = new SpotifyStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://open.spotify.com/artist/${artistId}`;
    stats.username = artistId; // set to artist id so that web ui can link to main page
    stats.artistId = artistId;
    stats.displayName = artistName;
    stats.followerCount = monthlyListeners;
    return stats;
}

/** Enhanced approach to get Spotify stats by directly interacting with the page */
async function getSpotifyStatsEnhanced(context: BrowserContext, artistId: string): Promise<SpotifyStats> {
    const page: Page = await createStealthPage(context);
    const url: string = `https://open.spotify.com/artist/${artistId}`;

    const stats = new SpotifyStats();
    stats.timeRetrieved = new Date().getTime();
    stats.link = url;
    stats.artistId = artistId;
    stats.username = artistId;

    try {
        await stealthNavigate(page, url, 10000); // Wait even longer
        // Try to get the artist name from the page title
        const title = await page.title();
        if (title && title.includes('|')) {
            stats.displayName = title.split('|')[0].trim();
        }
        // Try to find monthly listeners by searching through all text content
        let monthlyListeners = 0;
        try {
            // Get all text content from the page
            const textContent = await page.textContent('body');
            if (textContent) {
                // Look for various patterns that might contain monthly listeners
                const patterns = [
                    /(\d{1,3}(?:,\d{3})*)\s+monthly\s+listers/i, // Match full numbers with commas like "33,014,737 monthly listeners"
                    /(\d{1,3}(?:,\d{3})*)\s*monthly/i, // Match full numbers with commas like "33,014,737 monthly"
                    /(\d+[KMB]?)\s+monthly\s+listers/i, // Fallback for simpler format
                    /(\d+[KMB]?)\s+listers/i,
                    /monthly\s+listers.*?(\d+[KMB]?)/i,
                ];
                for (const pattern of patterns) {
                    const match = textContent.match(pattern);
                    if (match && match[1]) {
                        monthlyListeners = convertAbbreviateNumberStr(match[1]);
                        break;
                    }
                }
            }
        } catch (e) {
            // Ignore
        }

        // If monthly listeners is still not set, try to find it in specific elements
        if (monthlyListeners === 0) {
            try {
                // Look for any element that might contain listener information
                const elements = await page.$$('*');
                for (const element of elements) {
                    const text = await element.textContent();
                    if (text && text.match(/\d+[KMB]?\s+monthly\s+listers/i)) {
                        const match = text.match(/(\d+[KMB]?)\s+monthly\s+listers/i);
                        if (match && match[1]) {
                            monthlyListeners = convertAbbreviateNumberStr(match[1]);
                            break;
                        }
                    }
                }
            } catch (e) {
                // Ignore
            }
        }

        stats.followerCount = monthlyListeners;
    } catch (error) {
        console.log('Error in enhanced Spotify stats:', error);
    } finally {
        await page.close();
    }

    return stats;
}

async function getSpotifyPageContent(context: BrowserContext, artistId: string): Promise<string> {
    const page: Page = await createStealthPage(context);
    const url: string = `https://open.spotify.com/artist/${artistId}`;
    await stealthNavigate(page, url, 8000); // Wait longer for dynamic content

    // Try to wait for specific elements that might contain the data
    try {
        await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
        // Ignore if not found
    }

    const content = await page.content();
    await page.close();
    return content;
}
/** Get json data object present in page contents */
function getJsonFromPageContents(htmlContent: string): object {
    const regex = /<script type="application\/ld+\+json">[^>]*<\/script>/gm;
    const matches = htmlContent.match(regex);
    if (!!matches) {
        for (const match of matches) {
            const json = match.split('json">')[1].split('</')[0];
            const data = JSON.parse(json);
            return data;
        }
    }
    return {};
}
/** Get the monthly listeners count number from the spotify artist's page contents */
function getMonthlyListenersFromPageContents(htmlContent: string): number {
    try {
        // Method 1: Try JSON-LD approach first
        const data = getJsonFromPageContents(htmlContent);
        if (data && data['description']) {
            const desc = data['description'];
            const abbrevNum = desc.split('monthly listeners')[0].split('·')[1];
            if (abbrevNum) {
                return convertAbbreviateNumberStr(abbrevNum.trim());
            }
        }

        // Method 2: Try to find monthly listeners in page text (with comma support)
        const monthlyMatch = htmlContent.match(/(\d{1,3}(?:,\d{3})*(?:[KMB])?)\s+monthly\s+listers/i);
        if (monthlyMatch && monthlyMatch[1]) {
            return convertAbbreviateNumberStr(monthlyMatch[1]);
        }

        // Method 3: Fallback for simpler format
        const monthlyMatchSimple = htmlContent.match(/(\d+[KMB]?)\s+monthly\s+listers/i);
        if (monthlyMatchSimple && monthlyMatchSimple[1]) {
            return convertAbbreviateNumberStr(monthlyMatchSimple[1]);
        }

        // Method 4: Try to find any listeners count
        const listenersMatch = htmlContent.match(/(\d+[KMB]?)\s+listers/i);
        if (listenersMatch && listenersMatch[1]) {
            return convertAbbreviateNumberStr(listenersMatch[1]);
        }

        return 0;
    } catch {
        return 0;
    }
}
/** Get the artist's display name name from the spotify artist's page contents */
function getArtistNameFromPageContents(htmlContent: string): string {
    try {
        // Method 1: Try JSON-LD approach first
        const data = getJsonFromPageContents(htmlContent);
        if (data && data['name']) {
            return data['name'];
        }

        // Method 2: Try to extract from page title
        const titleMatch = htmlContent.match(/<title>([^|]+)/);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1].trim();
        }

        // Method 3: Try to find in H1 elements
        const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
        if (h1Match && h1Match[1]) {
            const name = h1Match[1].trim();
            if (name && !name.includes('Your Library') && !name.includes('Choose a language')) {
                return name;
            }
        }

        return '';
    } catch {
        return '';
    }
}
