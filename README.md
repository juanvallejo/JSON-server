UAS JSON Server
======================================================

JSON Server for UAS competition. Makes calls to the SUAS server API

Requires the Node.js framework to run, along with the Node.js dependencies listed.

####Dependencies

The following are Node.js packages that are required to run this server. To install these packages, you must have the Node Package Manager installed.

**Install the Node Package Manager (npm)**

#####Linux

``` sh
sudo apt-get install npm
```

#####Mac

``` sh
brew install npm
```

**Install dependencies**

Use npm to install dependencies: `npm install`

####Running Server

To run the server, make sure to have followed the above steps, and type the following.

``` sh
node server
```

Note: if you are using Ubuntu, or any other Linux distro like it, but mainly Ubuntu because that's where I've seen this happen, and the above command does something else than run the Node.js server, change your Linux distro to something better, and type...

```
nodejs server
```

####Sending data to the server

The server (as noted on its comments, if you, you know, actually read its code) will listen for http requests (client connections mainly) on port `8000`, and raw MAVLink data on port `7777`. Don't ask how I decided on these port numbers, I just did. 

####Useful links

- http://dev.ardupilot.com/wiki/setting-up-sitl-on-linux/
