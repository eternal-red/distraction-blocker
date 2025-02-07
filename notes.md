
## Configuration
1. Download the ca.crt from selenium and put it into the allowed certs in google chrome.
    - (it isn't required but may reduce captchas)

## To do 
1. bypass captchas/avoid captchas (kinda solved)
2. create user interface to quickly add and remove blacklists
3. when user opens new tab create new driver and connect to it
4. setup a cronjob that starts up our python script whenever user opens a browser with chromium
5. get chromium to connect to existing browser instances