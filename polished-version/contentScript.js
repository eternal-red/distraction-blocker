// Global constants
const MEDITATION_INTERVAL = 40000; // 30 minutes
const REDIRECT_URL = chrome.runtime.getURL("public/redirect.html");
const REFLECT_URL = chrome.runtime.getURL("popup/reflect.html");
const restricted_sites = new Set();

console.log(`restricted_sites: ${restricted_sites}`);

// Initialize blocked sites from storage
function initializeBlockedSites() {
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
        const blockedWebsitesArray = data.blockedWebsitesArray || [];
        restricted_sites.clear(); // Ensure the set is updated
        blockedWebsitesArray.forEach((item) => {
            restricted_sites.add(item);
            console.log(`Added link to restricted_sites: ${item}`);
        });
        // Initial check when script runs
        check_if_restricted();
    });
}

// Check if current page is restricted
function check_if_restricted() {
    const currentURL = window.location.href;
    for (let restrictedPath of restricted_sites) {
        if (currentURL.includes(restrictedPath)) {
            redirectToPage(REDIRECT_URL)
            return;
        }
    }
    console.log(`Allowed: ${currentURL} does not include any restricted paths.`);
}

// Meditation timer handler
function handleMeditation() {
    chrome.storage.sync.get(["focusMode", "lastRedirectTime"], function(data) {
        if (!data.focusMode) return;

        const currentTime = Date.now();
        const lastTime = data.lastRedirectTime || 0;
        console.log(`the time elapse:${currentTime-lastTime}`)
        if (currentTime - lastTime >= MEDITATION_INTERVAL) {    
            redirectToPage(REFLECT_URL)
        }
    });
} 


// Redirect to a custom blocked page
function redirectToPage(URL) {
    console.log(`Blocking ${window.location.href}`);
    window.location.replace(URL);
}

// Function to block Instagram content
function removeElementByXPath(xpath) {
    let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) {
        console.log(`Removing element: ${xpath}`);
        element.remove();
    } else {
        //console.log(`Element not found: ${xpath}`);
    }
}

// Monitor and Remove Elements Dynamically
function removeRestrictedElement() {
    const targetXPaths = [
        "/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div[1]/div/div/div[2]",
        "/html/body/ytd-app/div[1]/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-rich-grid-renderer/div[6]"
    ];
    
    // Remove elements immediately if present
    for (const xpath of targetXPaths){removeElementByXPath(xpath);}
    // Use MutationObserver to handle dynamically loaded elements
    const observer = new MutationObserver(() => {
        for (const xpath of targetXPaths){removeElementByXPath(xpath);}
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Monitor page changes
function monitorPageChanges() {
    let lastURL = window.location.href;
    console.log("Monitoring page changes...");

    // Listen for pushState and replaceState changes (Single Page Apps)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
        originalPushState.apply(this, arguments);
        onPageChange();
    };

    history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        onPageChange();
    };

    window.addEventListener("popstate", onPageChange); // Detect back/forward navigation

    // Monitor DOM changes (for dynamically loaded content)
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastURL) {
            lastURL = window.location.href;
            onPageChange();
        }
    });

    observer.observe(document, { childList: true, subtree: true });
}

// Function to handle URL changes
function onPageChange() {
    console.log("Page changed, checking restrictions...");
    check_if_restricted();
}

// Function to handle blocking a new site (Button Click)
function blockSite(url) {
    console.log(`Blocking new site: ${url}`);
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
        let blockedSites = data.blockedWebsitesArray || [];

        if (!blockedSites.includes(url.toLowerCase())) {
            blockedSites.push(url.toLowerCase());
            chrome.storage.sync.set({ "blockedWebsitesArray": blockedSites }, function () {
                console.log(`Site added to blocklist: ${url}`);
                // Refresh window after saving
                window.location.reload();
            });
        } else {
            console.log("Site already in blocklist.");
        }
    });
}

// Initialize everything
function initialize() {
    initializeBlockedSites();
    monitorPageChanges();
    
    // Check focus mode and initialize features
    chrome.storage.sync.get("focusMode", function(data) {
        if (chrome.runtime.lastError) {
            console.error("Error accessing storage:", chrome.runtime.lastError);
            return;
        }

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
monitorPageChanges();