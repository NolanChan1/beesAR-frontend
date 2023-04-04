# BeesARFrontend

This mobile web application project was built using vanilla JavaScript, HTML and CSS. It uses jQuery for support and WebXR and Three.js as the primary libraries for AR functionality.

## Running Development server locally

Since vanilla JavaScript/HTML pages lack a server by default, we use an app to serve the pages for us. One of the options is to use 'Web Server for Chrome' extension on Chrome Web Store (https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/related). 

Download the Web Server app and run it, then click Choose Folder and navigate to src/app.

### Running server for development/troubleshooting

If the goal is to develop/troubleshoot/debug the application, follow the steps below. If the goal is to just use the application by having a server for it, look at the next section (Running server for just using the application) instead.

After setting up the Chrome Web Server, to set up the server for debugging/development/troubleshooting only, use a USB cable to connect an Android phone to the desktop and enable USB Debugging on the phone in the developer settings (instructions vary depending on phone models). Grant the desktop permission to access phone files.

Navigate to chrome://inspect and enable Port Forwarding by clicking on the 'Port Forwarding' button and enter the port and host information. By default, the port would be 8887 and the hostname would be localhost:8887. Click on the checkbox that says 'Enable Port Forwarding' at the bottom of this modal and click 'Done'.

Back on the main page of chrome://inspect, if the mobile device granted permission to the desktop to view files and if USB debugging was set up correctly, it would show the phone under the 'Remote Target' header, with a list of Google Chrome tabs open on the phone. Use the url box below the 'Remote Target' header to enter localhost:8887 as the url and open it. This tab should now show up under the list of tabs open on the phone. Click the Inspect button below the tab to open the developer console that shows changes made to the tab open on the mobile phone.

Use the web app on the phone as usual and the changes will be reflected in the console window on the desktop, which can help debug/troubleshoot/develop the application.

### Running server for just using the application

To use the app on the phone without physically connecting it to the desktop/server, we need to use a service that broadcasts the server on the internet so that the phone can connect to it. One option for doing that is using ngrok, a command line application (with web GUI) that can serve applications on the internet. Download ngrok from its website (ngrok.com/download) using the preferred method and open up its command line interface. Once the Chrome Web Server is set up, run the command

ngrok http 8887 --oauth google
(if using windows, use ngrok.exe instead of ngrok on the command line)
(8887 is the default port number of this application. If the port number was changed, please modify that argument accordingly)
(--oauth google is a basic protection that requires users to log in via a google account. It is better than allowing free access to anyone on the website, but anyone with a google account can also log in. ngrok has further resources on defining more sophisticated authentication mechanisms).

ngrok will show a display of the url generated to host this application. Use the phone to navigate to the url displayed and login using google (if google authentication is kept as is) to access the application normally.


## Contributors

- Abhishek Balasubramanian
- Nolan Chan
- Braeden King
- Rubaiyet Meem
- Dylan Windsor
- Hao Nguyen
