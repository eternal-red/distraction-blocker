// This function creates the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "simpleMenuItem",
      title: "Block Element",
      contexts: ["all"], // This will show the menu item on any page
    });
  });
  
  // This listens for when the context menu item is clicked
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "simpleMenuItem") {
        // window.open("www.youtube.com");
        console.log("Hello There");
    //   alert("Simple Context Menu item clicked!");
    // alert("Hello");
    }
  });
  