import time
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Define the request and response interceptor function
def interceptor(request):
    # Check if the URL contains youtube.com and shorts
    if 'youtube.com' in request.url and 'shorts' in request.url:
        print(f"Blocking request to: {request.url}")
        request.abort()  # Abort the request to prevent it from being sent
        close_and_open_new_tab(driver)  # Close current tab and open a new one

    if request.response and 'youtube.com' in request.url and 'shorts' in request.url:
        print(f"Blocking response from: {request.url}")
        request.abort()  # Abort the response to prevent it from being delivered
        close_and_open_new_tab(driver)  # Close current tab and open a new one

# Function to close the current tab and open a new one
def close_and_open_new_tab(driver):
    driver.execute_script("window.close()")  # Close the current tab
    driver.execute_script("window.open('about:blank', '_blank')")  # Open a new tab
    print("New tab opened.")

# Setup Chrome WebDriver with Selenium Wire
options = webdriver.ChromeOptions()

# Initialize the driver and set up the interceptor before navigating to any page
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.request_interceptor = interceptor  # Set the interceptor before page load

# Start with a blank page to keep the session open
driver.get("https://www.google.com")

# Track new requests and responses
last_index = 0
try:
    while True:
        new_requests = driver.requests[last_index:]
        last_index = len(driver.requests)

        for request in new_requests:
            if request.response:
                print("\n\n\nnext:\n")
                print(f"Request URL: {request.url}")
                print(f"Response Status Code: {request.response.status_code}")
                print("-" * 80)

        time.sleep(2) #avoid cpu overheating

except KeyboardInterrupt:
    print("\nClosing gracefully...")
    driver.quit()
