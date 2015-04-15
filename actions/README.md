Interoperability Actions
========================

Pretty much based on the Test case module. Allows actions to be defined to tell the server to perform certain tasks with the modules defined.

###Running these actions

To run all of the actions on this folder using the action module library, make sure you `cd` into this folder and type the line below...

```
node ./
```

*Make sure* that both the uas competition (python) server and the json server are running  when actions are run.
The uas competition server does not come with this project. It can be downloaded at [https://github.com/pmtischler/auvsi_suas_competition](https://github.com/pmtischler/auvsi_suas_competition).

###Starting the uas competition server

```
cd competition_server_folder
cd src
cd auvsi_suas_server
```

If it is the first time running the competition server, initialize its database with the command below

```
python manage.py syncdb
```

The competition server will be automatically started when the main module is run.

```
cd {root_directory_of_interop_server}
node ./
```

The server should be started on port 8080, but if you prefer a different port, you must change the UAS_PORT constant in `Globals.js` located in `/ the root folder` on the json server repo

###Starting the json server

The json server provides wrappers, libraries, and unit-test libraries for makign requests to the uas python server.

This test case module should be bundled in with the json server and located  at `path_to_json_repo/tests`. But this should already be the case anyway.

```
cd {path_to_interop_repo}
node ./
```

###Writing new actions

Any new test cases should use the new action library api and should be placed inside of actions/. (Open any of the existing actions to see an example).

New actions will automatically be added and run by the action library when the command above is used. Make sure you are in this folder when running the command above.

As you may have just found out, you do in fact need Node.js to run these tests. And the main server.js. And pretty much everything else in this repository. To install, read the actual README.md file supplied in the root directory of this repository.
