import { BrowserContext, Page } from 'playwright';
import { convertAbbreviateNumberStr } from '../helper_functions/abbrev_num_convert';
import { getBase64ImageFromUrl } from '../helper_functions/base64_url_img_fetch';

export class TiktokStats {
    timeRetrieved: number = 0;
    link: string = '';
    displayName: string = '';
    handle: string = '';
    totalPosts: number = 0;
    likes: number = 0;
    followerCount: number = 0;
    followingCount: number = 0;
    iconUrl: string = '';
    iconBase64: string = '';

    public print() {
        console.log('TikTok ' + this.displayName + ' Info:');
        console.log('Handle (@): ' + this.handle);
        console.log('Total Followers: ' + this.followerCount);
        console.log('Total Following: ' + this.followingCount);
    }
}

// TODO - follow stats retrieval pattern from instagram_stats.ts
