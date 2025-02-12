document.addEventListener('DOMContentLoaded', function() {
    // Function to update the time in chrome.storage.sync
    function updateTime() {
        const currentTime = Date.now();
        chrome.storage.sync.set({ "lastRedirectTime": currentTime }, function() {
            console.log("lastRedirectTime updated to (set method):", currentTime);
        });
        displayLastRedirectTime();
    }

    // Function to display the last redirect time
    function displayLastRedirectTime() {
        chrome.storage.sync.get("lastRedirectTime", function(data) {
            var outputElement = document.getElementById("time");
            if (data.lastRedirectTime) {
                outputElement.textContent = new Date(data.lastRedirectTime).toLocaleString();
                const lastTime = data.lastRedirectTime || 0;
                console.log("Time since last redirect:", Date.now() - lastTime);
            } else {
                outputElement.textContent = "No redirect time set";
            }
        });
    }

    // Function to navigate to another URL
    function goToURL() {
        window.location.href = "https://www.spotify.com";
    }

    // Attach event listeners to buttons by their IDs
    var updateButton = document.getElementById("updateButton");
    var goToUrlButton = document.getElementById("goToUrlButton");

    updateButton.addEventListener("click", function() {
        updateTime();
        displayLastRedirectTime();
    });
    goToUrlButton.addEventListener("click", goToURL);

    // Display the last redirect time on page load
    displayLastRedirectTime();
});