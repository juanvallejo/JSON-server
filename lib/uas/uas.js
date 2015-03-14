/**
 * UAS competition server "wrapper" to relay test cases and requests using the nodejs interoperability server
 * 
 * @author juanvallejo
 * @date 3/10/15
 */

var UAS = {};

// import and assign modules
UAS.modules = require('./modules');

/**
 * Interoperability function
 *
 * Sends a post / get request to the UAS competition server through its interoperability api.
 * The competition server must be running locally for now, but this will be changed before the actual competition, to support volatile
 * ip addresses and ports. Read the wiki for information https://github.com/pmtischler/auvsi_suas_competition/wiki/UAS-Telemetry
 *
 * Actual post data is required to be formatted as url-encoded form-data (e.g. altitude=65&longitude=165)
 * Parameters must be 'latitude', 'longitude', 'altitude_msl', and 'uas_heading'. These are explained on the wiki and below:
 *
 * 		latitude			The latitude of the aircraft as a floating point degree value. Valid values are: -90 <= latitude <= 90.
 *		longitude			The longitude of the aircraft as a floating point degree value. Valid values are: -180 <= longitude <= 180.
 *		altitude_msl		The height above mean sea level (MSL) of the aircraft in feet as a floating point value.
 *		uas_heading			The heading of the aircraft as a floating point degree value. Valid values are: 0 <= uas_heading <= 360.
 *
 * @param postData 	{String} 	UAS data to send to the competition server
 * @param callback 	{Function}	steps to execute after file is parsed.
 */
UAS.handleRequest = function(request, postData, callback) {

	if(typeof callback != 'function') {
		callback = {};
	}

	if(request.headers['uasapi-require-authentication']) {
		return UAS.modules.request.makeRequestWithAuthentication(request, postData, callback);
	}

	UAS.modules.request.makeRequest(request, postData, callback);

}

 module.exports = UAS;