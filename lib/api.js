#!/bin/env node

/**
 * Core api functions. Handles functions exposed by the public api endpoints. The API module is invoked any time a request
 * is sent with /api/... at its root.
 *
 * Note: This is an API template based on a previously-done application. Please read comments on `database.js` file to get a better perspective on its method calls.
 * The information from the previous app used with this file is left intact as a sample "template" for future uses.
 *
 * @author	juanvallejo
 * @date 	3/9/15
 */

// import Database object
var Database 		= require('./database.js');
var PublicResponses = require('./public_responses.js');
var Utilities 		= require('./utilities.js');

// define our main API object
var API = {};

/**
 * adds a message to the database, and updates latest message in its conversation object
 */
API.postMessageToDatabase = function(sender, recipient, message, timestamp, conversationId, callback) {
	Database.insertInto('keeptouch_message', ['is_read', 'timestamp', 'message_text', 'reciever_id', 'sender_id', 'conversation_id'], [0, timestamp, message, recipient, sender, conversationId], callback);
}

/**
 * adds a user, logged in through facebook to the mysql database
 */
API.addUserToDatabase = function(name, thumbnail, facebookId, callback) {
	Database.insertInto('keeptouch_user', ['name', 'thumbnail', 'fb_id'], [name, thumbnail, facebookId], callback);
}

/**
 * Fetch an individual message for a user from mysql database. Returns as JSON response
 *
 * @param messageId = [Integer]		id of message to fetch
 * @param callback 	= [Function]	function to call after message is returned
 */
API.getMessageFromDatabase = function(messageId, callback) {
	Database.selectFrom('keeptouch_message', ['*'], 'id="' + messageId + '"', callback);
}

/**
 * Used to update conversation values, primarily after a message has been posted dynamically
 */
API.updateConversationById = function(conversationId, columnsToUpdate, valuesToUpdate, callback) {
		Database.update('keeptouch_conversation', columnsToUpdate, valuesToUpdate, 'id="' + conversationId + '"', callback);
}

/**
 * Fetch an individual conversation for a pair of users from mysql database. Returns as JSON response
 * Does NOT include any messages. Simply the conversation's data
 *
 * @param conversationId 	= [Integer]		id of conversation item to fetch (Does NOT include messages)
 * @param callback 			= [Function]	function to call after message is returned
 */
API.getConversationFromDatabase = function(conversationId, callback) {
	Database.selectFrom('keeptouch_conversation', ['*'], 'id="' + conversationId + '"', callback);
}

/**
 * Fetch an individual conversation for a pair of users from mysql database, using both of those user's ids. Returns as JSON response
 * Does NOT include any messages. Simply the conversation's data. Sample endpoint -> /conversation/{user_id_1}/{user_id_2}
 *
 * @param firstRecipientId 	= [Integer]		id of the first user involved in a conversation
 * @param secondRecipientId = [Integer]		id of the second user involved in a conversation
 * @param callback 			= [Function]	function to call after message is returned
 */
API.getConversationByRecipientIdsFromDatabase = function(firstRecipientId, secondRecipientId, callback) {
	Database.selectFrom('keeptouch_conversation', ['*'], '(user1_id="' + firstRecipientId + '" AND user2_id="' + secondRecipientId + '") OR (user1_id="' + secondRecipientId + '" AND user2_id="' + firstRecipientId + '")', callback);
}

/**
 * Requires a conversation id. Returns the last 20 messages in a conversation between two users,
 * ordered by message timestamp.
 *
 * @param conversationId 	= [Integer] id of conversation to return
 * @param callback			= [Function] id of second user participating in conversation to fetch
 */
API.getConversationMessagesFromDatabase = function(conversationId, callback) {
	Database.selectFrom('keeptouch_message', ['*'], 'conversation_id="' + conversationId + '" ORDER BY timestamp ASC LIMIT 20', callback);
}

/**
 * Returns all conversations where a user is either the recipient or sender. Ordered by timestamp, descending. Includes the latest message for each conversation in
 * the returned object.
 * 
 * @param recipientId 	= [Integer] 	id of recipient to return messages by sender for
 * @param callback		= [Function]	function to call after query returns
 */
API.getConversationsForRecipientIdFromDatabase = function(recipientId, callback) {
	Database.selectFrom('keeptouch_conversation', ['*'], 'user1_id="' + recipientId + '" OR user2_id="' + recipientId + '"', callback);
}

/**
 * Returns all contacts for a specific user id.
 *
 * @param recipientId 	= [Integer] 	id of recipient to return messages by sender for
 * @param callback		= [Function]	function to call after query returns
 */
API.getContactsForRecipientIdFromDatabase = function(recipientId, callback) {
	Database.selectFrom('keeptouch_user_friends LEFT JOIN keeptouch_user ON keeptouch_user_friends.to_user_id=keeptouch_user.id', ['*'], 'from_user_id="' + recipientId + '"', callback);
}

/**
 * Fetch a user object from a normal id
 *
 * @param userId 		= [Integer] 	facebook id of user to return user object for
 * @param callback		= [Function]	function to call after query returns
 */
API.getUserFromId = function(userId, callback) {
	Database.selectFrom('keeptouch_user', ['*'], 'id="' + userId + '"', callback);
}

/**
 * Fetch a user object from a facebook id
 *
 * @param facebookId 	= [Integer] 	facebook id of user to return user object for
 * @param callback		= [Function]	function to call after query returns
 */
API.getUserFromFacebookId = function(facebookId, callback) {
	Database.selectFrom('keeptouch_user', ['*'], 'fb_id="' + facebookId + '"', callback);
}

/**
 * checks to see if a conversation between two users exists, if it does, that one is returned, if not it is created, and then returned.
 */
API.createNewConversation = function(firstRecipientId, secondRecipientId, callback) {

	// see if a conversation between these two recipients exists
	Database.selectFrom('keeptouch_conversation', ['*'], '(user1_id="' + firstRecipientId + '" AND user2_id="' + secondRecipientId + '") OR (user1_id="' + secondRecipientId + '" AND user2_id="' + firstRecipientId + '")', function(err, rows, columns) {

		// determine if a conversation exists
		if(rows.length > 0) {
			return callback.call(Database, err, rows, callback);
		}

		if(err) {
			return PublicResponses.respondWithMessage(response, 'Mysql error: ' + err, 500);
		}

		// create new conversation between the two id's
		Database.insertInto('keeptouch_conversation', ['timestamp', 'is_read', 'user1_id', 'user2_id', 'last_message'], [Utilities.getISODateStamp(), 0, firstRecipientId, secondRecipientId,''], function(err, result) {

			if(err) {
				return PublicResponses.respondWithMessage(response, 'Mysql error: ' + err, 500);
			}

			Database.selectFrom('keeptouch_conversation', ['*'], 'id="' + result.insertId + '"', callback);

		});


	});

}

/**
 * Relays a POST uas request to uas api endpoint. Parses UAS-API
 * header data and POSTs to appropriate UAS server endpoint.
 * All requests make use of a pre-existing GET request.
 */
API.relayUASRequest = function(request, data, callback) {

	console.log('post data -> ' + data);
	callback.call(this, 'Response from uas server');

}

/**
 * Parse any request with /api/ as its root
 */
API.parseGETRequest = function(request, response) {

	var apiRequest = request.url.split('/api/')[1];
	var apiRequestFragment = apiRequest.split('/');

	// handle a get-message request. Fetch a single message by message_id
	if(apiRequestFragment[0] == 'uas') {

		// extract post data, 
		Utilities.extractPOSTData(request, function(data) {
			API.relayUASRequest(request, data, function(uasResponse) {
				response.end(uasResponse);
			});
		});

	} else {
		PublicResponses.respondWithMessage(response, 'Unimplemented api request: ' + apiRequest, 500);
	}

}

// expose our api functions
module.exports = API;