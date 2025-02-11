// Run once the window has loaded
window.onload = function () {
    updateBlockedWebsitesSection();
  
    var blockButton = document.getElementById("blockButton");
    var blockCurrentSiteButton = document.getElementById("blockCurrentSiteButton");
    var unlockButton = document.getElementById("unlockButton");
  
    blockButton.onclick = function () {
        getWebsiteInput();
    };
  
    blockCurrentSiteButton.onclick = function () {
        blockCurrentWebsite();
    };
  
    unlockButton.onclick = function () {
        unlockEditing();
    };
  };
  
  // Run once the DOM content is loaded
  document.addEventListener("DOMContentLoaded", function () {
    // Focus slider functionality
    const focusSlider = document.getElementById("focusSlider");
    
    // Get the stored focus mode state when the popup is loaded
    chrome.storage.sync.get("focusMode", function(data) {
        const isFocusModeOn = data.focusMode || false;
        focusSlider.checked = isFocusModeOn;
    });
  
    // Listen for changes in the focus mode slider
    focusSlider.addEventListener('change', function() {
        const newFocusModeState = focusSlider.checked;
        chrome.storage.sync.set({ focusMode: newFocusModeState }, function() {
            console.log("Focus Mode state saved: " + newFocusModeState);
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              chrome.tabs.reload(tabs[0].id);  // Reload the current active tab
            });
        });
    });
  
    // Toggle for Blocked Websites Dropdown
    const toggleButton = document.getElementById("toggleButton");
    const blockedWebsitesDiv = document.getElementById("blockedWebsitesDiv");
  
    toggleButton.addEventListener("click", function() {
      // Use getComputedStyle to check actual display value (since CSS sets it)
      if (getComputedStyle(blockedWebsitesDiv).display === "none") {
        blockedWebsitesDiv.style.display = "block"; // Show the div
        toggleButton.classList.add("rotate");       // Rotate the button
      } else {
        blockedWebsitesDiv.style.display = "none";  // Hide the div
        toggleButton.classList.remove("rotate");      // Remove the rotation
      }
    });
  });
  
  // Function to unlock editing if password is correct
  function unlockEditing() {
      var passwordInput = document.getElementById("passwordInput").value;
      var messageElement = document.getElementById("message");
    
      if (passwordInput === "password") {
          messageElement.textContent = "Editing unlocked!";
          messageElement.style.color = "green";
          // Enable delete buttons
          document.querySelectorAll(".delete").forEach(button => {
              button.disabled = false;
          });
      } else {
          messageElement.textContent = "Incorrect password. Try again.";
          messageElement.style.color = "red";
      }
  }
    
  // Function to manually add a website to the blocklist
  function getWebsiteInput() {
    var websiteInput = document.getElementById("websiteInput").value.trim();
  
    if (!websiteInput) {
        alert("Error: please enter a website URL");
        return;
    }
  
    addBlockedSite(websiteInput);
  }
  
  // Function to get the current website's URL and block it
  function blockCurrentWebsite() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let currentURL = new URL(tabs[0].url).href;
        // Drop URL protocol
        currentURL = currentURL.replace(/^https?:\/\//i, '');
        // Drop subdomain if needed
        const hasTwoDots = (currentURL.match(/\./g) || []).length;
        if (hasTwoDots > 1) {
            currentURL = currentURL.replace(/^([^\.]+\.)/, '');
        }
        // Drop path
        const hasTwoSlashes = (currentURL.match(/\//g) || []).length;
        if (hasTwoSlashes > 1) {
          currentURL = currentURL.replace(/^([^\/]+\/[^\/]+).*$/, '$1');
        }
        // Drop parameters and data
        currentURL = currentURL.replace(/\?.*$/, '');
        console.log(`Blocking current site in popup: ${currentURL}`);
        addBlockedSite(currentURL, true); // true -> Reload tab after blocking
    });
  }
  
  // Function to add a site to the blocklist and update UI
  function addBlockedSite(url, shouldReload = false) {
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
        let blockedWebsitesArray = data.blockedWebsitesArray || [];
  
        if (blockedWebsitesArray.includes(url.toLowerCase())) {
            alert("Error: URL is already blocked");
            return;
        }
  
        blockedWebsitesArray.push(url.toLowerCase());
        chrome.storage.sync.set({ "blockedWebsitesArray": blockedWebsitesArray }, function () {
            console.log(`Added ${url} to blocklist.`);
            updateBlockedWebsitesSection();
  
            if (shouldReload) {
                chrome.tabs.reload(); // Refresh the page to apply blocking
            }
        });
    });
  }
  
  // Function to update the Popup's 'Blocked Websites' section
  function updateBlockedWebsitesSection() {
    const blockedWebsitesDiv = document.getElementById("blockedWebsitesDiv");
    blockedWebsitesDiv.innerHTML = ""; // Clear previous list
  
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
        const blockedWebsitesArray = data.blockedWebsitesArray || [];
  
        if (blockedWebsitesArray.length > 0) {
            blockedWebsitesArray.forEach((website, index) => {
                const websiteDiv = document.createElement("div");
                websiteDiv.classList.add("websiteDiv");
  
                const websiteDivText = document.createElement("div");
                websiteDivText.classList.add("websiteDivText");
                websiteDivText.textContent = website;
                websiteDiv.appendChild(websiteDivText);
  
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete");
                deleteButton.setAttribute("data-index", index);
                deleteButton.disabled = true; // Initially disabled
  
                const trashIcon = document.createElement("i");
                trashIcon.classList.add("fas", "fa-trash");
                deleteButton.appendChild(trashIcon);
  
                deleteButton.addEventListener("click", unblockURL);
                websiteDiv.appendChild(deleteButton);
  
                blockedWebsitesDiv.appendChild(websiteDiv);
            });
        } else {
            const nothingBlocked = document.createElement("div");
            nothingBlocked.textContent = "No websites have been blocked";
            nothingBlocked.classList.add("nothingBlocked");
            blockedWebsitesDiv.appendChild(nothingBlocked);
        }
    });
  }
  
  // Function to unblock a website
  function unblockURL(event) {
    const index = event.target.closest("button").getAttribute("data-index");
  
    chrome.storage.sync.get("blockedWebsitesArray", function (data) {
        let blockedWebsitesArray = data.blockedWebsitesArray || [];
        blockedWebsitesArray.splice(index, 1);
  
        chrome.storage.sync.set({ "blockedWebsitesArray": blockedWebsitesArray }, function () {
            updateBlockedWebsitesSection();
        });
    });
  }
  