from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Define the request interceptor
def interceptor(request):
    blocked_domain = "youtube.com"
    blocked_path = "/shorts/"
    # Check if request is to YouTube and contains "/shorts/"
    if blocked_domain in request.url and blocked_path in request.url:
        print(f"Blocking request: {request.url}")
        request.abort()  # Prevent request from being sent
