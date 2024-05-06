/**
 * Performs a smooth scroll on the page
 * @param {Object} page - Puppeteer page object
 * @param {number} scrollDistance - Distance to scroll in pixels
 * @returns {Promise<void>}
 */
async function smoothScroll(page, scrollDistance) {
    await page.evaluate((distance) => {
        window.scrollBy({
            top: distance,
            behavior: 'smooth'
        });
    }, scrollDistance);
}

/**
 * Waits for new content to load after scrolling
 * @param {Object} page - Puppeteer page object
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} - Returns true if new content was loaded
 */
async function waitForNewContent(page, timeout = 5000) {
    try {
        const previousHeight = await page.evaluate(() => document.body.scrollHeight);
        await page.waitForFunction(
            (height) => document.body.scrollHeight > height,
            { timeout },
            previousHeight
        );
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Scrolls through the feed and collects Reels data
 * @param {Object} page - Puppeteer page object
 * @param {string} targetUsername - Username to track likes from
 * @param {Object} options - Scrolling options
 * @returns {Promise<Array>} - Array of found Reels
 */
async function scrollAndCollectReels(page, targetUsername, options = {}) {
    const {
        maxScrolls = 10,
        scrollTimeout = 5000,
        scrollDistance = 800
    } = options;

    const foundReels = new Set();
    let scrollCount = 0;
    let hasNewContent = true;

    while (scrollCount < maxScrolls && hasNewContent) {
        // Extract Reels data
        const newReels = await page.evaluate((username) => {
            const reels = document.querySelectorAll('article');
            const results = [];

            reels.forEach(reel => {
                const likeText = reel.innerText;
                if (likeText.includes(`Liked by ${username}`)) {
                    const link = reel.querySelector('a')?.href;
                    const timestamp = reel.querySelector('time')?.dateTime;
                    const preview = reel.querySelector('video')?.poster || 
                                  reel.querySelector('img')?.src;
                    
                    if (link) {
                        results.push({
                            link,
                            timestamp,
                            preview,
                            likedBy: username
                        });
                    }
                }
            });

            return results;
        }, targetUsername);

        // Add new Reels to the set
        newReels.forEach(reel => foundReels.add(JSON.stringify(reel)));

        // Scroll and wait for new content
        await smoothScroll(page, scrollDistance);
        hasNewContent = await waitForNewContent(page, scrollTimeout);
        scrollCount++;

        // Small delay to prevent rate limiting
        await page.waitForTimeout(1000);
    }

    // Convert Set back to array of objects
    return Array.from(foundReels).map(reel => JSON.parse(reel));
}

module.exports = {
    smoothScroll,
    waitForNewContent,
    scrollAndCollectReels
}; 