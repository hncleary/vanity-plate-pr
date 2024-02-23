# Vanity Plate Social Statistics - Stat Retrieval Functions

Typescript + Playwright system for gathering basic following and viewership statistics from a number of social media and content distribution sites.

## Setup

-   Clone repository
-   run `npm install` within directory

## Run

-   run `npm run main` to run `main.ts` file containing testing functions

### Functionality Plans

    Get Basic Stats from:
    - [x] YouTube
    - [x] Tik Tok
    - [x] Instagram
    - [x] Twitter
    - [x] SoundCloud
    - [x] Spotify
    - [x] Newgrounds
    - [x] Twitch
    - [ ] Threads (Instagram)
    - [ ] Facebook
    - [ ] Sketchfab (?)
    - [ ] Reddit (?)
    - [ ] Cameo (?)
    - [ ] Billi Billi (?)
    - [ ] DeviantArt (?)
    - [ ] Tumblr (?)
    - [ ] Pinterest (?)
    - [ ] Shopify (?)
    - [ ] Snapchat (?)

    Add Object Input Definitions for:
    - [ ] Contact Information
    - [ ] Account Verification Status
    - [ ] Bio
    - [ ] Additional Links

    Additional Tasks:
    - [x] Add system for merging stats objects (invalid / empty parameter values should not overwrite what was previously valid)
    - [ ] Add system for optionally retrieving profile icon image data
    - [ ] Add directory creation system
    - [x] Create additional repo for angular site
    - [x] Create additional repo  for json data storage
        - [ ] Create Azure service for json data storage
    - [x] Create folder hierarchy system for multiple vanity social pages in database
    - [x] Create custom license plate generator for per-page flair
