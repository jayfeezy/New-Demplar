# Knights of Degen Image Extraction Guide

## Process for Extracting Authentic Character Images

1. Go to https://knightsofdegen.netlify.app/
2. Click on a character card
3. Click the top right corner of the character view
4. Select "Open in new tab"
5. Copy the image URL or save the picture
6. Add the URL to the knights-manual-extracted.js file

## Currently Verified Working Images:
- ALEX: https://images.ctfassets.net/b474hutgbdbv/2V3dKNSD41QjeLowfolcG3/e9a4eb087190d640b9c6c982a17480d4/image.png
- Lady Rangiku (λ2): https://images.ctfassets.net/b474hutgbdbv/3AYkauQlVdSQfVvdWtmaT/895be1409a709d60553bb820c213d45f/Rangiku.jpg
- The Fork Knight (λ2): https://images.ctfassets.net/b474hutgbdbv/6NXglOf0VcEyW0X6W0umnp/f6be1ff12713c114ecd0ba405a52c47f/Fork-JFSgen2.jpg

## Characters Needing Manual Extraction:
- INSPIRED
- CERTIFIEDLOVERBULL
- Tommy
- True Warrior
- DENOJAH
- Sir Nemo [AI]
- MDK

## How to Add New URLs:
Replace "MANUAL_EXTRACT_NEEDED" with the actual image URL in server/knights-manual-extracted.js

Example:
```javascript
avatarUrl: "https://images.ctfassets.net/b474hutgbdbv/[ASSET_ID]/[HASH]/[FILENAME]"
```