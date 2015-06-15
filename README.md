UAS JSON Server
======================================================

JSON Server for UAS competition. Makes calls to the SUAS server API

Requires the Node.js framework to run, along with the Node.js dependencies listed.

###Dependencies

The following are Node.js packages that are required to run this server. To install these packages, you must have the Node Package Manager installed.

####Install the Node Package Manager (npm)

#####Linux

``` sh
sudo apt-get install npm
```

#####Mac

``` sh
brew install npm
```

####Install dependencies

Use npm to install dependencies: `npm install`

####Prepare submodules

To get the mavlink submodule installed run

``` sh
git submodule init
```

Then actually download the submodule by running

``` sh
git submodule update
```

###Running Server

To run the server, make sure to have followed the above steps, and type the following.

``` sh
node ./
```

Note: if you are using Ubuntu, or any other Linux distro like it, but mainly Ubuntu because that's where I've seen this happen, and the above command does something else than run the Node.js server, change your Linux distro to something better, and type...

```
nodejs ./
```

###Running Test Cases

Before running the tests, you should probably change values of the username and password in the sourcecode of each test, or create a new user with a username "test" and password "test" so that all cases will pass.

To actually send "sample" requests to the server, cd into the `/tests` folder and run

```
node ./
```

For a more complete guide on running and making test cases, see the `README.md` file located inside the `tests` folder.

You can also locate and run the shell script:
```sh
run_tests
```

###Sending data to the server

The server (as noted on its comments, if you, you know, actually read its code) will listen for http requests (client connections mainly) on port `8000`, and raw MAVLink data on port `7777`. Don't ask how I decided on these port numbers, I just did. 

###Useful links

- http://dev.ardupilot.com/wiki/setting-up-sitl-on-linux/
