/**



*/

var http = require('http');
var Agent = require('../../node_modules/agentkeepalive');

var keepaliveAgent = new Agent({
            maxSockets: 100,
            maxFreeSockets: 10,
            timeout: 3000, // Time Out at 10 seconds
            keepAliveTimeout: 3000 // free socket keepalive for 3 seconds
        });

    var options = {
        host: 'localhost',
        port: 8000,
        path: '/api/test',
        method: 'POST',
        agent: keepaliveAgent
    };



    var req = http.request(options, function (res) {
/*
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
            });
 */
    });

    req.on('error', function (e) {
       console.log('problem with request: ' + e.message);
       });

    req.end();

    setTimeout(function () {
        console.log('keep alive sockets:');
        console.log(keepaliveAgent.unusedSockets);
    }, 2000);


