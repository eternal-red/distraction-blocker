import time
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
#from interceptor import interceptor

def interceptor(request):
    blocked_domain = "youtube.com"
    blocked_path = "/shorts/"
    # Check if request is to YouTube and contains "/shorts/"
    if blocked_domain in request.url and blocked_path in request.url:
        print(f"Blocking request: {request.url}")
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
                #print(f"URL: {request.url}")
                #print(f"Status Code: {request.response.status_code}")
                print("\n\n\nnext:\n")
                print(f"Request Headers: {request.url}")
                print("-" * 80)
        
            
                

        time.sleep(2)  # Avoid high CPU usage

except KeyboardInterrupt:
    print("\nClosing gracefully...")
    driver.quit()
