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
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: removeElementByXPath,
            args: [info.pageUrl] // You can pass additional arguments if needed
        })
        console.log("Hello There");
    //   alert("Simple Context Menu item clicked!");
    // alert("Hello");
    }
  });
  

  function removeElementByXPath() {
    xpath = getElementXPath();
    let element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) {
        console.log(`Removing element: ${xpath}`);
        element.remove();
    } else {
        console.log(`Element not found: ${xpath}`);
    }
}
  // Function to calculate the XPath of the clicked element
function getElementXPath(pageUrl) {
    // Get the clicked element
    const element = document.querySelector(':hover'); // Use hover state to identify the element
  
    if (!element) {
      console.log('No element found');
      return;
    }
  
    const xpath = getElementXPathString(element);
    console.log('XPath of the clicked element:', xpath);
  }
  
  // Function to calculate XPath string
  function getElementXPathString(element) {
    let xpath = '';
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = element.previousSibling;
      
      // Count the number of previous siblings with the same tag name
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      // Append to the XPath string
      xpath = '/' + element.tagName.toLowerCase() + '[' + index + ']' + xpath;
      element = element.parentNode;
    }
    
    return xpath ? xpath : null;
  }