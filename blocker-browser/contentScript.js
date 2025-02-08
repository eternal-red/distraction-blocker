// contentscript runs when webpage is loaded (when url changes)
const restricted_sites = new Set(); // only runs once cause const


console.log(`restricted_sites: ${restricted_sites}`);
chrome.storage.sync.get("blockedWebsitesArray", function (data) { //creates key (blockedWebsitesArray) to store blocked websites
    const blockedWebsitesArray = data.blockedWebsitesArray || [];
    restricted_sites.clear(); // Ensure the set is updated
    blockedWebsitesArray.forEach((item) => {
        restricted_sites.add(item);
        console.log(`Added link to restricted_sites: ${item}`);
    });
    // Initial check when script runs
    check_if_restricted();
});

// Start monitoring for page changes
monitorPageChanges();

// Check Focus Mode state in chrome.storage.sync
chrome.storage.sync.get("focusMode", function(data) {
  const isFocusModeOn = data.focusMode || false;  // Defaults to false if not set
  console.log("Focus Mode is", isFocusModeOn ? "on" : "off");

  if (isFocusModeOn) {
      // Only execute element removal or other actions if Focus Mode is ON
      removeRestrictedElement();
      
  }
});

// attaches the storage listener
// Listen for changes in blocklist and refresh page if updated
chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockedWebsitesArray) {
      const { oldValue = [], newValue = [] } = changes.blockedWebsitesArray;

      // Using Set to improve filtering performance
      const oldSet = new Set(oldValue);
      const changedURLs = newValue.filter(url => !oldSet.has(url));

      // If new URLs were added, log and refresh
      if (changedURLs.length > 0) {
          console.log("New sites added to blocklist:", addedUrls);
          window.location.reload(); // Refresh the page
      }
    }
});

// Check if the website should be blocked
function check_if_restricted() {
  console.log("Checking if current site is restricted...");
  if (shouldBlockWebsite()) {
      redirectToBlockedPage();
  } 
}

// Check if the current website should be blocked
function shouldBlockWebsite() {
    const currentURL = window.location.href;
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
    console.log(`Blocking ${window.location.href}`);
    window.location.replace("http://127.0.0.1:3000/public/redirect.html"); // Change this URL to your actual blocked page
}

// function to block instagram content
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
            const currentURL = window.location.href;
            blockSite(currentURL);
        });
    }
});
