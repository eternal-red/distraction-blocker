// Global constants
const MEDITATION_INTERVAL = 1000; // 30 minutes
const REFLECTION_URL = "https://example.com"
const restricted_sites = new Set();

// Initialize blocked sites from storage
function initializeBlockedSites() {
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
        const blockedWebsitesArray = data.blockedWebsitesArray || [];
        restricted_sites.clear();
        blockedWebsitesArray.forEach((item) => {
            restricted_sites.add(item);
            console.log(`Added link to restricted_sites: ${item}`);
        });
        check_if_restricted();
    });
}

// Meditation timer handler
function handleMeditation() {
    chrome.storage.sync.get(["focusMode", "lastMeditationTime"], function(data) {
        if (!data.focusMode) return;

        const currentTime = Date.now();
        const lastTime = data.lastMeditationTime || 0;
        
        if (currentTime - lastTime >= MEDITATION_INTERVAL) {
            chrome.storage.sync.set({ lastMeditationTime: currentTime });
            window.location.href = "http://127.0.0.1:5500/vivaldi-blocker/popup/meditate.html";
        }
    });
}

// Check if current page is restricted
function check_if_restricted() {
    const currentURL = window.location.hostname;
    if (restricted_sites.has(currentURL)) {
        window.location.href = REFLECTION_URL;
    }
}

// Monitor page changes
function monitorPageChanges() {
    const observer = new MutationObserver(() => {
        check_if_restricted();
    });
    observer.observe(document, { subtree: true, childList: true });
}

// Remove distracting elements in focus mode
function removeRestrictedElement() {
    // Add element removal logic here
    const distractingElements = document.querySelectorAll('.ads, .social-media, .recommendations');
    distractingElements.forEach(element => element.remove());
}

// Initialize everything
function initialize() {
    initializeBlockedSites();
    monitorPageChanges();
    
    // Check focus mode and initialize features
    chrome.storage.sync.get("focusMode", function(data) {
        const isFocusModeOn = data.focusMode || false;
        console.log("Focus Mode is", isFocusModeOn ? "on" : "off");
        
        if (isFocusModeOn) {
            removeRestrictedElement();
            setInterval(handleMeditation, 60000); // Check meditation timer every minute
            handleMeditation(); // Initial check
        }
    });
}

// Start the extension
initialize();
