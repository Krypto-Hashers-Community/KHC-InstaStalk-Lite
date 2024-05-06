let isTracking = false;
let targetUsername = '';
let foundReels = new Set();
let autoScrollInterval = null;
let isAutoScrolling = false;

// Debug logging function
function debugLog(message) {
    console.log(`[InstaStalk] ${message}`);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    debugLog('Received message: ' + JSON.stringify(message));
    
    if (message.action === 'startTracking') {
        targetUsername = message.username;
        isTracking = true;
        debugLog('Starting tracking for user: ' + targetUsername);
        startTracking();
        sendResponse({ status: 'started' });
    } else if (message.action === 'stopTracking') {
        stopTracking();
        sendResponse({ status: 'stopped' });
    } else if (message.action === 'pageLoaded') {
        debugLog('Page loaded: ' + message.url);
        if (isTracking) {
            startTracking();
        }
    }
    return true; // Keep the message channel open for async responses
});

// Function to wait for elements to load
async function waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
}

// Function to extract Reels data and auto-like
async function extractReelsData() {
    debugLog('Extracting Reels data...');
    
    // Wait for articles to load
    const articles = document.querySelectorAll('article');
    if (!articles.length) {
        debugLog('No articles found');
        return [];
    }
    
    debugLog(`Found ${articles.length} articles`);
    const newReels = [];

    for (const article of articles) {
        try {
            const likeText = article.innerText;
            debugLog('Article text: ' + likeText);
            
            if (likeText.includes(`Liked by ${targetUsername}`)) {
                const link = article.querySelector('a[href*="/reel/"]')?.href;
                const timestamp = new Date().toISOString();
                
                if (link && !foundReels.has(link)) {
                    debugLog('Found new Reel: ' + link);
                    foundReels.add(link);
                    newReels.push({ link, timestamp });

                    // Find and click the like button if not already liked
                    const likeButton = article.querySelector('button svg[aria-label="Like"]')?.closest('button');
                    if (likeButton) {
                        debugLog('Found like button, clicking...');
                        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
                        likeButton.click();
                        debugLog('Clicked like button');
                    }
                }
            }
        } catch (error) {
            debugLog('Error processing article: ' + error.message);
        }
    }

    debugLog(`Found ${newReels.length} new Reels`);
    return newReels;
}

// Function to save Reels data
async function saveReelsData(newReels) {
    if (newReels.length === 0) return;

    try {
        // Get existing data
        const { reelsData = [] } = await chrome.storage.local.get('reelsData');
        
        // Add new reels
        const updatedReels = [...reelsData, ...newReels];
        
        // Save updated data
        await chrome.storage.local.set({ 
            reelsData: updatedReels,
            reelsCount: updatedReels.length,
            lastUpdated: new Date().toISOString()
        });

        debugLog(`Saved ${newReels.length} new Reels. Total: ${updatedReels.length}`);

        // Update popup
        chrome.runtime.sendMessage({
            action: 'updateStats',
            reelsCount: updatedReels.length,
            likedCount: foundReels.size
        });
    } catch (error) {
        debugLog('Error saving data: ' + error.message);
    }
}

// Improved smooth scroll function with natural behavior
function smoothScroll() {
    const scrollAmount = Math.floor(Math.random() * 300) + 600;
    const currentPosition = window.scrollY;
    const targetPosition = currentPosition + scrollAmount;
    
    debugLog(`Scrolling from ${currentPosition} to ${targetPosition}`);
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    return new Promise(resolve => setTimeout(resolve, 1000));
}

// Function to simulate natural scrolling patterns
async function startAutoScroll() {
    if (isAutoScrolling) return;
    isAutoScrolling = true;
    debugLog('Starting auto-scroll');

    while (isTracking && isAutoScrolling) {
        try {
            // Random pause between scrolls (2-4 seconds)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 2000));
            
            if (!isTracking || !isAutoScrolling) break;
            
            await smoothScroll();
            
            // Extract and process new Reels after scrolling
            const newReels = await extractReelsData();
            await saveReelsData(newReels);

            // Occasionally pause for longer (20% chance)
            if (Math.random() < 0.2) {
                debugLog('Taking a longer pause...');
                await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 3000));
            }
        } catch (error) {
            debugLog('Error in auto-scroll: ' + error.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Pause on error
        }
    }
}

function stopAutoScroll() {
    debugLog('Stopping auto-scroll');
    isAutoScrolling = false;
}

// Main tracking function
async function startTracking() {
    debugLog('Starting tracking process');
    
    // Wait for the feed to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Initial scan
    const initialReels = await extractReelsData();
    await saveReelsData(initialReels);

    // Start auto-scrolling
    startAutoScroll();

    // Add random mouse movements to appear more natural
    document.addEventListener('mousemove', (e) => {
        if (isTracking && Math.random() < 0.1) {
            const randomX = e.clientX + (Math.random() * 10 - 5);
            const randomY = e.clientY + (Math.random() * 10 - 5);
            const moveEvent = new MouseEvent('mousemove', {
                clientX: randomX,
                clientY: randomY,
                bubbles: true
            });
            document.dispatchEvent(moveEvent);
        }
    });
}

function stopTracking() {
    debugLog('Stopping tracking');
    isTracking = false;
    stopAutoScroll();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    debugLog('Page unloading, stopping tracking');
    stopTracking();
}); 