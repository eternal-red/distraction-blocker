const restricted_sites = new Set();

// Retrieve the blockedWebsitesArray from Chrome storage
console.log("Retrieving blocked websites from Chrome storage...");
chrome.storage.sync.get("blockedWebsitesArray", function (data) {
    const blockedWebsitesArray = data.blockedWebsitesArray || [];
    
    if (blockedWebsitesArray.length > 0) {
        restricted_sites.clear(); // Ensure the set is updated
        blockedWebsitesArray.forEach((item) => {
            restricted_sites.add(item.toLowerCase());
            console.log(`Added to restricted_sites: ${item.toLowerCase()}`);
        });

        // Initial check when script runs
        check_if_restricted();
    } else {
        console.log("No blocked websites found.");
    }
});

// **Listen for changes in blocklist and refresh page if updated**
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes.blockedWebsitesArray) {
        let oldBlocklist = changes.blockedWebsitesArray.oldValue || [];
        let newBlocklist = changes.blockedWebsitesArray.newValue || [];

        // Check if a new site was added
        let addedUrls = newBlocklist.filter(url => !oldBlocklist.includes(url));

        if (addedUrls.length > 0) {
            console.log("New sites added to blocklist:", addedUrls);
            window.location.reload(); // Refresh the page immediately
        }
    }
});

// Normalize URL by removing 'www.' from the beginning
function normalizeURL(url) {
    return url.replace(/^www\./i, "").toLowerCase();
}

// Check if the current website should be blocked
function shouldBlockWebsite() {
    const currentURL = normalizeURL(window.location.href);
    
    for (let restrictedPath of restricted_sites) {
        if (currentURL.includes(restrictedPath)) {
            console.log(`Blocked: ${currentURL} includes restricted path: ${restrictedPath}`);
            return true;
        }
    }
    
    console.log(`Allowed: ${currentURL} does not include any restricted paths.`);
    return false;
}

// Redirect to a custom blocked page
function redirectToBlockedPage() {
    // document.inner
    // const head = document.head || document.getElementsByTagName("head")[0];
    // head.insertAdjacentHTML("beforeend", style);
    window.location.replace("http://127.0.0.1:3000/blocker-browser/popup/redirect.html")
    // window.open("http://127.0.0.1:3000/blocker-browser/popup/redirect.html")
    
}

// Check if the website should be blocked
function check_if_restricted() {
    console.log("Checking if current site is restricted...");
    if (shouldBlockWebsite()) {
        redirectToBlockedPage();
    } else {
        removeRestrictedElement(); // Remove the specified XPath element if the site is not blocked
    }
}

// **Function to Remove Element by XPath**
function removeElementByXPath(xpath) {
    let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) {
        console.log(`Removing element: ${xpath}`);
        element.remove();
    } else {
        console.log(`Element not found: ${xpath}`);
    }
}

// **Monitor and Remove Element Dynamically**
function removeRestrictedElement() {
    const targetXPath = "/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div[1]/div/div/div[2]";
    
    // Remove immediately if present
    removeElementByXPath(targetXPath);

    // Use MutationObserver to handle dynamically loaded elements
    const observer = new MutationObserver(() => {
        removeElementByXPath(targetXPath);
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Function to listen for page changes (SPA & full page loads)
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

// Start monitoring for page changes
monitorPageChanges();

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "simpleMenuItem",
      title: "Block Element",
      contexts: ["all"], // This will show the menu item on any page
    });
  });



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

// Attach the block function to a button (assuming you have an HTML button with ID "blockButton")
document.addEventListener("DOMContentLoaded", function () {
    const blockButton = document.getElementById("blockButton");
    if (blockButton) {
        blockButton.addEventListener("click", function () {
            const currentURL = normalizeURL(window.location.href);
            blockSite(currentURL);
        });
    }
});
