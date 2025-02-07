import time
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

# Setup Chrome WebDriver with Selenium Wire
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Initialize blacklist and file path
blacklist = []
blacklist_file = 'url-check-method/blacklist.txt'

# Load blacklist from the file
def load_blacklist():
    global blacklist
    try:
        with open(blacklist_file, 'r') as file:
            blacklist = [line.strip() for line in file.readlines()]
            for webpath in blacklist:
                if webpath[0] == "#":  # Remove comment lines starting with '#'
                    blacklist.remove(webpath)
        print("Blacklist reloaded:", blacklist)
    except FileNotFoundError:
        print("Warning: 'blacklist.txt' not found.")

# Function to check URL with blacklist and block if needed
def check_and_block_url():
    for webpath in blacklist:
        if webpath in driver.current_url:
            print(f"Blocked: {driver.current_url}")
            driver.get("https://www.spotify.com/us/premium/")  # Redirect to Spotify
            break

# Function to block URLs with '@' symbol
def block_links_with_at_symbol():
    if '@' in driver.current_url:
        print(f"Blocked URL with '@': {driver.current_url}")
        driver.get("https://www.spotify.com/us/premium/")  # Redirect to Spotify

# Function to create a new driver instance and attach it to the current active tab
def create_and_attach_new_driver():
    # Open a new tab using the existing driver
    driver.execute_script("window.open('');")
    # Switch to the new tab
    driver.switch_to.window(driver.window_handles[-1])
    driver.get("https://www.youtube.com")  # Open a default URL in the new tab
    print(f"New driver attached to tab with URL: {driver.current_url}")

# Start with the YouTube page
driver.get("https://www.youtube.com")

# Load initial blacklist
load_blacklist()

try:
    while True:
        # Block any URL containing '@' in the current tab
        block_links_with_at_symbol()
        
        # Check current URL against the blacklist
        check_and_block_url()

        time.sleep(2)  # Sleep to prevent high CPU usage

except KeyboardInterrupt:
    print("\nClosing gracefully...")
    driver.quit()
