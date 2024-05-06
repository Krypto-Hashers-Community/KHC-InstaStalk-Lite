document.addEventListener('DOMContentLoaded', () => {
  const targetUsernameInput = document.getElementById('targetUsername');
  const startTrackingButton = document.getElementById('startTracking');
  const stopTrackingButton = document.getElementById('stopTracking');
  const downloadDataButton = document.getElementById('downloadData');
  const statusDiv = document.getElementById('status');
  const reelsCountSpan = document.getElementById('reelsCount');
  const likedCountSpan = document.getElementById('likedCount');
  const lastUpdatedSpan = document.getElementById('lastUpdated');
  const trackingStatusSpan = document.getElementById('trackingStatus');

  let isTracking = false;

  // Load saved data and stats
  chrome.storage.local.get(['targetUsername', 'reelsCount', 'likedCount', 'lastUpdated', 'isTracking'], (data) => {
    if (data.targetUsername) {
      targetUsernameInput.value = data.targetUsername;
    }
    if (data.reelsCount) {
      reelsCountSpan.textContent = data.reelsCount;
    }
    if (data.likedCount) {
      likedCountSpan.textContent = data.likedCount;
    }
    if (data.lastUpdated) {
      lastUpdatedSpan.textContent = new Date(data.lastUpdated).toLocaleString();
    }
    if (data.isTracking) {
      updateTrackingUI(true);
    }
  });

  startTrackingButton.addEventListener('click', async () => {
    const username = targetUsernameInput.value.trim();
    if (!username) {
      showStatus('Please enter a username', 'error');
      return;
    }

    // Save username
    chrome.storage.local.set({ 
      targetUsername: username,
      isTracking: true
    });

    // Check if we're on Instagram
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url.includes('instagram.com')) {
      showStatus('Please open Instagram first', 'error');
      return;
    }

    // Start tracking
    chrome.tabs.sendMessage(tab.id, { 
      action: 'startTracking',
      username: username
    });

    updateTrackingUI(true);
    showStatus('Started tracking and auto-liking...', 'success');
  });

  stopTrackingButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.includes('instagram.com')) {
      chrome.tabs.sendMessage(tab.id, { action: 'stopTracking' });
    }

    chrome.storage.local.set({ isTracking: false });
    updateTrackingUI(false);
    showStatus('Tracking stopped', 'warning');
  });

  downloadDataButton.addEventListener('click', () => {
    chrome.storage.local.get(['reelsData'], (data) => {
      if (!data.reelsData || !data.reelsData.length) {
        showStatus('No data to download', 'error');
        return;
      }

      const reelsText = data.reelsData.map(reel => 
        `${reel.link} (Liked: ${new Date(reel.timestamp).toLocaleString()})`
      ).join('\n');

      const blob = new Blob([reelsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      chrome.downloads.download({
        url: url,
        filename: `instagram_reels_${timestamp}.txt`,
        saveAs: true
      });
    });
  });

  function updateTrackingUI(tracking) {
    isTracking = tracking;
    startTrackingButton.style.display = tracking ? 'none' : 'block';
    stopTrackingButton.style.display = tracking ? 'block' : 'none';
    trackingStatusSpan.textContent = tracking ? 'Actively tracking' : 'Not tracking';
    targetUsernameInput.disabled = tracking;
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    setTimeout(() => {
      statusDiv.className = 'status';
    }, 3000);
  }

  // Listen for updates from content script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateStats') {
      reelsCountSpan.textContent = message.reelsCount;
      if (message.likedCount) {
        likedCountSpan.textContent = message.likedCount;
      }
      lastUpdatedSpan.textContent = new Date().toLocaleString();
    }
  });
}); 