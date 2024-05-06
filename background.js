// Debug logging function
function debugLog(message) {
    console.log(`[InstaStalk Background] ${message}`);
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    debugLog('Extension installed');
    // Initialize storage
    chrome.storage.local.set({
        reelsData: [],
        reelsCount: 0,
        likedCount: 0,
        lastUpdated: null,
        isTracking: false
    });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('instagram.com')) {
        debugLog(`Instagram page loaded: ${tab.url}`);
        
        // Check if we're tracking
        chrome.storage.local.get(['isTracking', 'targetUsername'], (data) => {
            if (data.isTracking && data.targetUsername) {
                debugLog('Resuming tracking for: ' + data.targetUsername);
                chrome.tabs.sendMessage(tabId, {
                    action: 'startTracking',
                    username: data.targetUsername
                }).catch(error => {
                    debugLog('Error sending message: ' + error.message);
                });
            }
        });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    debugLog('Received message: ' + JSON.stringify(message));
    if (message.action === 'updateStats') {
        chrome.storage.local.set({
            reelsCount: message.reelsCount,
            likedCount: message.likedCount,
            lastUpdated: new Date().toISOString()
        });
    }
}); 