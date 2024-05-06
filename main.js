require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { scrollAndCollectReels } = require('./utils/scroll');

// Configuration
const CONFIG = {
    headless: process.env.HEADLESS === 'true',
    maxScrolls: parseInt(process.env.MAX_SCROLLS, 10) || 10,
    scrollTimeout: parseInt(process.env.SCROLL_TIMEOUT, 10) || 5000,
    dataDir: path.join(__dirname, 'data')
};

async function setupBrowser() {
    const browser = await puppeteer.launch({
        headless: CONFIG.headless,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    return { browser, page };
}

async function login(page) {
    console.log('🔑 Logging into Instagram...');
    
    await page.goto('https://www.instagram.com/accounts/login/');
    await page.waitForSelector('input[name="username"]');
    
    // Type credentials
    await page.type('input[name="username"]', process.env.IG_USERNAME);
    await page.type('input[name="password"]', process.env.IG_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation and possible security checks
    try {
        await page.waitForNavigation();
        console.log('✅ Login successful!');
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        throw error;
    }
}

async function saveResults(reels, targetUsername) {
    // Create data directory if it doesn't exist
    await fs.mkdir(CONFIG.dataDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(CONFIG.dataDir, `${targetUsername}_${timestamp}.json`);
    
    await fs.writeFile(filename, JSON.stringify(reels, null, 2));
    console.log(`💾 Saved ${reels.length} Reels to ${filename}`);
}

async function main() {
    const targetUsername = process.env.TARGET_USERNAME;
    if (!targetUsername) {
        console.error('❌ Please set TARGET_USERNAME in your .env file');
        process.exit(1);
    }

    const { browser, page } = await setupBrowser();
    
    try {
        await login(page);
        
        // Navigate to Reels feed
        console.log('📱 Navigating to Reels feed...');
        await page.goto('https://www.instagram.com/reels/');
        await page.waitForTimeout(3000); // Wait for feed to load
        
        // Scroll and collect Reels
        console.log(`🔍 Scanning for Reels liked by ${targetUsername}...`);
        const reels = await scrollAndCollectReels(page, targetUsername, {
            maxScrolls: CONFIG.maxScrolls,
            scrollTimeout: CONFIG.scrollTimeout
        });
        
        // Save results
        if (reels.length > 0) {
            await saveResults(reels, targetUsername);
            console.log(`✨ Found ${reels.length} Reels liked by ${targetUsername}`);
        } else {
            console.log('😕 No liked Reels found for this user');
        }
        
    } catch (error) {
        console.error('❌ An error occurred:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the script
main().catch(console.error); 