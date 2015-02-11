var http = require('http');
 
// our main function. Runs on program start
(function main(argv) {
    
    var netRequest = http.request({
        method:'POST',
        host:'127.0.0.1',
        port:'8080'
    }, function(response) {
        //console.log that mavlink listener has been tested
    });
    
    netRequest.end("Hello World");
    
})(process.argv);
