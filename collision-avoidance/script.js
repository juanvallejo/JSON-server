

/**
   
   This is where we will write the script for the collision avoidance. 
   In here we will look at connecting with the ardu pilot submod. 
   and will find any functions we can run to actually vear the plane away from the obsticle. 

   The best way to do this is by injecting waypoints, and then having the ardu pilot read from this.
   The testscript.py is a python script we may be able to potentially use to inject waypoints.
   

   Obsticles held in the competition servers waypoint table
   You can access the dataabase with the shell script I wrote, and can view information in those tables.
   
   
   
   Author: David Kroell, Juan Vallejo

*/

//Store JSON data from competition server in an array.

$.get("0.0.0.0:8080", {}, function(results){
	alert(results);
	
	
    });
