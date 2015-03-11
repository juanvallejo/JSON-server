#!/bin/env node

 /**
 * Node.js server request handler functions
 *
 * @author 	juanvallejo
 * @date 	3/9/15
 */

// import global variables and other package dependencies
var fs 				= require('fs');
var url 			= require('url');
var https 			= require('https');

var Globals 		= require('./globals.js');
var Routers 		= require('./routers.js');
var Mimes 			= require('./mimes.js');
var API 			= require('./api.js');
var Utilities 		= require('./utilities.js');
var Responses 		= require('./responses.js');
var PublicResponses	= require('./public_responses.js');
var UAS 			= require('./uas.js');

var Handlers = {};

/**
 * handles current request as a call to (conveniently) one of this server's functions, which in turn (ideally) calls and
 * sends data to the competition server's api. Request must use POST method, as it only handles competition server's API post requests.
 */
function handleRequestAsUASAPICall(request, response) {

	// make sure request is done using the POST method
	if(request.method != 'POST') {
		console.log('<API> UAS API requests must use POST method.');
		return Responses.respondOKWithMessage('FAIL'); 
	}

	// init post data stream string
	var postData = '';
 
	request.on('data', function(chunk) {
		postData += chunk;
	});

	request.on('end', function() {
		
		// listen for end of body stream
		console.log('<API> Obtained request body. Passing to UAS API function.');		
		// get requested UAS API function
		var requestedAPIFunction 	= UAS[request.headers['uasapi-method']];

		// if there is no UAS API method passed, or there is no API function to handle the method requested, fail the request
		if(!requestedAPIFunction || typeof requestedAPIFunction != 'function') {
			
			response.writeHead(SERVER_RES_OK);
			response.end('FAIL');

			return console.log('<API> Error. Undefined interoperability function.');

		}

		// check to see if requested method is of method type GET
		if(request.headers && request.headers['uasapi-request-method'] && request.headers['uasapi-request-method'] == 'GET') {
			if(UAS.authenticationRequestCookies) console.log('COOKIES FOUND');
			console.log(request.headers['uas']);
			return console.log('GET REQUEST MADE');
		}

		// call interoperability function and handle a response
		requestedAPIFunction(postData, function(APIResponse, APIResponseCookies) {

			console.log('<UAS_API> Received response from API function.');

			// only handle the APIResponse if it is an IncomingMessage from the server
			// return an OK request test call if the message is a simple string
			if(typeof APIResponse == 'string') {

				console.log('<UAS_API> Response body from an API function received -> ' + APIResponse);

				response.writeHead(SERVER_HEAD_OK);
				response.end('OK');

				return false;

			}

			// start logging any body data
			var APIResponseData = '';

			APIResponse.on('data', function(chunk) {
				APIResponseData += chunk;
			});

			APIResponse.on('end', function() {

				console.log('<UAS_API> Response body from the competition server received -> ' + APIResponseData);

				response.writeHead(APIResponse.statusCode);
				response.end(APIResponseData);

			});

		});

	});
 
}

/**
 * determine if API message is to be served (GET) or posted (POST)
 */
Handlers.handleRequestAsAPIMessageEndpoint = function(request, response) {

	if(request.method != 'POST') {
		return PublicResponses.respondWithMessage(response, 'Warning: This endpoint requires POST method.', 500);
	}

	var postBody = '';

	// get response body
	request.on('data', function(chunk) {
		postBody += chunk;
	});

	request.on('end', function() {

		var postBodyAsJSON = {};
		var postBodyFragments = postBody.split('&');

		postBodyFragments.forEach(function(bodyFragment) {
			var bodyFragmentPair = bodyFragment.split('=');
			postBodyAsJSON[bodyFragmentPair[0]] = bodyFragmentPair[1];
		});

		// check to see that the correct message parameters were sent and post message to the database
		if(postBodyAsJSON['sender'] && postBodyAsJSON['recipient'] && postBodyAsJSON['message'] && postBodyAsJSON['conversation_id']) {
			API.postMessageToDatabase(postBodyAsJSON['sender'], postBodyAsJSON['recipient'], postBodyAsJSON['message'], Utilities.getISODateStamp(), postBodyAsJSON['conversation_id'], function(err, rows, columns) {
				
				if(err) {
					return PublicResponses.respondWithMessage(response, 'Mysql error: ' + err, 500);
				}

				API.updateConversationById(postBodyAsJSON['conversation_id'], ['is_read', 'timestamp', 'last_message'], ['1', Utilities.getISODateStamp(), postBodyAsJSON['message']], function(err, rows, columns) {

					if(err) {
						return PublicResponses.respondWithMessage(response, 'Mysql error: ' + err, 500);
					}

					PublicResponses.respondWithMessage(response, 'success', 200);

				});

			});
		} else {
			PublicResponses.respondWithMessage(response, '', 500);
		}

	});

}

/**
 * Serves current request as a stream from a file on the server
 */
Handlers.handleRequestAsFileStream = function (request, response) {

	var pathToFile 		= Routers.requestRouter(request, response);
	var fileMimeType 	= Mimes.mimeTypeParser(request, response);

	Responses.respondWithFile(response, pathToFile, fileMimeType);
}

/** 
 * Handle all server requests
 */
Handlers.mainRequestHandler = function(request, response) {

	// assign global definition for current request being handled
	Globals.currentRequest = Routers.requestRouter(request, response);

	if(typeof Globals.currentRequest == 'function') {
		// if request calls an application function, define and call that function
		Handlers[Globals.currentRequest()](request, response);
	} else if(Globals.currentRequest.match(/^\/test(\/)?$/gi)) {
		Responses.respondOK(response);
	} else if(Globals.currentRequest.match(/^\/api\/([a-z0-9\/])+/gi)) {
		API.parseGETRequest(request, response);
	} else {
		Handlers.handleRequestAsFileStream(request, response);
	}
}

// expose our api
module.exports = Handlers;