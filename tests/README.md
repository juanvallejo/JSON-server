Telemetry tests
===============

Essentially test competition server api calls on the actual `server.js` file.
Both the UAS python test server and our JSON server.js server must be running.

###Running these tests

To run any of the tests on this folder using the test module library, type the line below...

```
node ./
```

###Writing new test cases

Any new test cases should use the new test library api and should be placed inside of tests/. (Open any of the existing tests to see an example).

New tests will automatically be added and run by the testing library when the command above is used. Make sure you are in this folder when running the command above.

As you may have just found out, you do in fact need Node.js to run these tests. And the main server.js. And pretty much everything else in this repository. To install, read the actual README.md file supplied in the root directory of this repository.
