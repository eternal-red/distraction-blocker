# Installation
To install the software follow these steps:
1. download a zip of the github
2. go to "chrome://extensions" in your browser for any chromium browser (chrome, brave, vivaldi)
3. turn on developer mode in the upper right corner
4. load unpacked and upload the entire "distraction-blocker-extension" folder

# Process

## Goals

In this project, I was exploring different possible implementations to actually create software that could block any subsection of a website or remove any part of a website that was rendered. 

## Strategy

I tried implementations with multiple different frameworks and libraries. At first, I created a prototype with SeleniumWire that could successfully identify and block website requests on the path level. However, I found out that SeleniumWire was unable to keep track of which tab the user was currently on and SeleniumWire could only control traffic for one tab. Thus, if a user opened a new tab and went back to an old one then SeleniumWire would not be monitoring the traffic of the old tab and there would be no blocking. 

I then found an existing website blocker browser extension and built upon it to see what features it could actually do. I was able to do the following tasks:
- blocking by path (even for websites that use query strings for webpages)
- blocking parts of a website (with xpaths)
- redirect a page to website without user interaction
- let users select paths with 1 click
- timer based blocking (even when app is closed)
I was unable to do this tasks:
- let users select xpaths with 1 click
- preventing user from disabling blocker in browser

Additionally, I found that certain js functions did not work in a browser extension. The alert function would mess us how the browser extension window was rendered. Upon the alert function running, the browser extension window would not appear when clicked on unless another different extension was clicked on first. I opted to use a DOM framework instead and that did not have this issue.

## Demo 
![](demo/distraction-blocker-demo.mp4)

## Insights
The primary insight I learned is coding the blocking logic was far easier to do through a browser extension. I could add a cronjob or windows script to ensure the extension was installed and enabled. This would avoid the complexity of implementing all of the blocking logic through Operating Systems cals for both IOS and Windows, leading to a far easier development approach.

Another insight I found out through user testing is the ability to disable the blocker was abused by users. If there was a password field and the user knew the password, they would disable the blocker without truly taking the time to reflect and be reminded of their tasks they want to do.

## Looking Back

If I had to start over the project again, I would definitely not have tried using SeleniumWire at all. SeleniumWire is a python library and only works in the browser it creates. It is unable to monitor browsers it doesn't control. Thus, a prototype using SeleniumWire would be hard to make usable in a final product. This is especially important because I was doing an implementation prototype. 

## Next Steps

My next design question is how to ensure the browser extension is not disabled or bypassed. I would like to do implementation prototypes in creating a cronjob to ensure the browser extension is correctly configured.

