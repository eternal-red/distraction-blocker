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
    function saveFormData() {
        let new_reflection = document.getElementById("feedback").value;
        chrome.storage.sync.get({ reflections: [] }, function(data) {
            let updated_reflections = data.reflections; // Get existing timestamps array
            updated_reflections.push(new_reflection); // Add new timestamp
            chrome.storage.sync.set({ reflections: updated_reflections }, function() {
                console.log("added new reflection");
            });
        });
    }

    // Attach event listeners to buttons by their IDs
    var updateButton = document.getElementById("updateButton");
    var saveButton = document.getElementById("saveFormData");

    updateButton.addEventListener("click", function() {
        updateTime();
        displayLastRedirectTime();
    });
    saveButton.addEventListener("click", saveFormData);

    // Display the last redirect time on page load
    displayLastRedirectTime();
});