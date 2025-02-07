'''
if link with @ then block that too when ctrl+r
 https://www.youtube.com/@penguinz0
'''

import time
#import keyboard  # For detecting hotkeys
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Setup Chrome WebDriver with Selenium Wire
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Initialize blacklist
blacklist = []
blacklist_file = 'url-check-method/blacklist.txt'
def load_blacklist():
    global blacklist
    try:
        with open(blacklist_file, 'r') as file:
            blacklist = [line.strip() for line in file.readlines()]
            for webpath in blacklist:
                if webpath[0] == "#":
                    blacklist.remove(webpath)
        print("Blacklist reloaded:", blacklist)
    except FileNotFoundError:
        print("Warning: 'blacklist.txt' not found.")
        
# Define hotkey action to reload blacklist
#keyboard.add_hotkey("cmd+shift+a", load_blacklist)

# Open with Google search page
driver.get("https://www.youtube.com")

try:
    load_blacklist()
    if not blacklist:
        print("Blacklist is empty. Add URLs to 'blacklist.txt' to block them.")

    while True:
        # Check current URL against the blacklist
        for webpath in blacklist:
            print(webpath)
            if webpath in driver.current_url:
                driver.get("https://www.spotify.com/us/premium/")
                break

        time.sleep(2)  # Prevent excessive CPU usage

except KeyboardInterrupt:
    print("\nClosing gracefully...")
    driver.quit()
