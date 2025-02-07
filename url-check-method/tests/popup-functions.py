import time
import keyboard  # For detecting hotkeys
import PySimpleGUI as sg  # For creating the popup
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Setup Chrome WebDriver with Selenium Wire
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Initialize blacklist
blacklist = []
blacklist_file = 'url-check-method/blacklist.txt'

# Load blacklist function
def load_blacklist():
    global blacklist
    try:
        with open(blacklist_file, 'r') as file:
            blacklist = [line.strip() for line in file.readlines()]
        print("Blacklist reloaded:", blacklist)
    except FileNotFoundError:
        print("Warning: 'blacklist.txt' not found. Creating an empty one.")
        open(blacklist_file, 'w').close()  # Create an empty file if missing
        blacklist = []

# Function to open the popup to edit the blacklist using PySimpleGUI
def open_popup():
    # Define the window layout
    layout = [
        [sg.Text("Enter URL to add/remove:")],
        [sg.InputText(key="url_input", size=(40, 1))],
        [sg.Button("Add to Blacklist"), sg.Button("Remove from Blacklist"), sg.Button("Close")]
    ]

    # Create the window
    window = sg.Window("Edit Blacklist", layout, finalize=True)

    while True:
        event, values = window.read()

        if event == sg.WINDOW_CLOSED or event == "Close":
            break

        url = values["url_input"].strip()
        if url:
            if event == "Add to Blacklist":
                blacklist.append(url)
                with open(blacklist_file, 'a') as file:
                    file.write(f"{url}\n")  # Append to file
                print(f"Added '{url}' to blacklist.")
            elif event == "Remove from Blacklist" and url in blacklist:
                blacklist.remove(url)
                with open(blacklist_file, 'w') as file:
                    for item in blacklist:
                        file.write(f"{item}\n")  # Overwrite the file with updated list
                print(f"Removed '{url}' from blacklist.")
            window["url_input"].update('')  # Clear input field
        else:
            sg.popup_error("Please enter a valid URL.")

    window.close()

# Define hotkey action to reload blacklist and open popup
keyboard.add_hotkey("cmd+shift+r", load_blacklist)  # Reload blacklist
keyboard.add_hotkey("cmd+shift+e", open_popup)  # Open popup to edit blacklist

# Open with Google search page
driver.get("https://www.google.com")

try:
    load_blacklist()
    if not blacklist:
        print("Blacklist is empty. Add URLs to 'blacklist.txt' to block them.")

    while True:
        # Check current URL against the blacklist
        for webpath in blacklist:
            if webpath in driver.current_url:
                print(f"Redirecting from {webpath}...")
                driver.get("https://www.spotify.com/us/premium/")
                break

        time.sleep(2)  # Prevent excessive CPU usage

except KeyboardInterrupt:
    print("\nClosing gracefully...")
    driver.quit()
