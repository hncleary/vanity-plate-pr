import { Browser, BrowserContext, Page } from "playwright";
import { getBase64ImageFromUrl } from "../helper_functions/base64_url_img_fetch";
const fs = require('fs') // Built-in filesystem package for Node.js

export class SoundCloudStats { 
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    username: string = ';'
    followers: number = 0;
    iconUrl: string = '';
    iconBas64: string = '';
    following: number = 0;
    tracks: number = 0;

    public print() { 
        console.log('SoundCloud ' + this.displayName + ' Info:');
        console.log('Username: ' + this.username);
        console.log('Total Followers: ' + this.followers);
        console.log('Following: ' + this.following);
        console.log('Tracks: ' + this.tracks);
    }
}
export async function getSoundcloudStatsArr(context: BrowserContext, usernames: string[]): Promise<SoundCloudStats[]> { 
    const soundcloudStats: SoundCloudStats[] = [];
    for(const handle of usernames) { 
        const data = await getSoundcloudStats(context, handle);
        soundcloudStats.push(data);
    }
    return soundcloudStats;
}

/** Get an object containing info and statistics for a soundcloud profile given a browser context and username */
export async function getSoundcloudStats(context: BrowserContext, username: string): Promise<SoundCloudStats> { 
    const content: string = await getSoundCloudPageContent(context, username);
    const name = getDisplayNameFromContent(content);
    const followers: number = getFollowersFromContent(content);
    const following: number = getFollowingFromContent(content);
    const trackCount: number = getTrackCountFromContent(content);
    const stats = new SoundCloudStats();
    const iconUrl = getProfileImgUrlFromContent(content);
    const iconBase64: string = await getBase64ImageFromUrl(iconUrl);
    stats.timeRetrieved = new Date().getTime();
    stats.link = `https://soundcloud.com/${username}`;
    stats.displayName = name;
    stats.username = username;
    stats.followers = followers;
    stats.iconUrl = iconUrl;
    stats.iconBas64 = iconBase64;
    stats.following = following;
    stats.tracks = trackCount;
    return stats;
}

async function getSoundCloudPageContent(context: BrowserContext, username: string) { 
    const page: Page = await context.newPage(); 
    const url = `https://soundcloud.com/${username}`;
    await page.goto(url); 
    await page.waitForTimeout(5000);
    const content = await page.content();
    await page.close();
    return content;
}

function getDisplayNameFromContent(content: string): string { 
    const regex = /<span class="soundTitle__usernameText">(.|\n)*<\/span>/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const nameTxt: string = match.split('>')[1].split('<')[0];
            return nameTxt.trim();
        }
    }
    return '';
}
function getProfileImgUrlFromContent(content: string): string { 
    const regex = /<span style="background-image: url\(&quot;(.|\n)*&quot/gm;
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const item: string = match.split('&quot;')[1];
            return item.trim();
        }
    }
    return '';
}
function getFollowersFromContent(content: string): number { 
    const regex = /<a href="\/.*\/followers" rel="nofollow" class="infoStats__statLink sc-link-light sc-link-primary" title=".* followers">/gm
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const txt: string = match.split('title="')[1].split('followers"')[0];
            return Number(txt.trim().split(',').join(''));
        }
    }
    return 0;
}
function getFollowingFromContent(content: string): number { 
    const regex = /<a href="\/.*\/following" rel="nofollow" class="infoStats__statLink sc-link-light sc-link-primary" title="Following.*people">/gm
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const txt: string = match.split('title="Following')[1].split('people"')[0];
            return Number(txt.trim().split(',').join(''));
        }
    }
    return 0;
}
function getTrackCountFromContent(content: string): number { 
    const regex = /<a href="\/.*\/tracks" rel="nofollow" class="infoStats__statLink sc-link-light sc-link-primary" title=".*tracks">/gm
    const matches = content.match(regex);
    if(!!matches) { 
        for(const match of matches) { 
            const txt: string = match.split('title="')[1].split('tracks"')[0];
            return Number(txt.trim().split(',').join(''));
        }
    }
    return 0;
}