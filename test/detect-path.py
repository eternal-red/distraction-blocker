'''
The program looks for requests that will redirect to YouTube Shorts and 
drops them. The issue is there are many ways to get to youtube shorts, 
(ie. multiple buttons) so it will be hard for users to block all of them on their own.
'''

'''
requests that lead to reels:
- POST /youtubei/v1/reel/reel_item_watch?prettyPrint=false HTTP/
'''

import time
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def interceptor(request):
    blocked_domain = "youtube.com"
    blocked_path = "/youtubei/v1/reel/reel_item_watch"
    if blocked_domain in request.host and blocked_path in request.path:
        print("ABORTED:")
        request.abort()  # Prevent request from being sent

# Setup Chrome WebDriver with Selenium Wire
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.request_interceptor = interceptor

# Start with a blank page to keep the session open
driver.get("https://www.google.com")

last_index = 0
try:
    while True:
        new_requests = driver.requests[last_index:]
        last_index = len(driver.requests)
        for request in new_requests:
            if request.response:
                print(f"\n\n\nnext {last_index}:\n")
                print(f"Request Headers: {request.url}")
                print("-" * 80)
        time.sleep(2)  # Avoid high CPU usage

except KeyboardInterrupt:
    print("\nClosing gracefully...")
    driver.quit()
