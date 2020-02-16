// This file contains api routes
// Each object properties defines a single route  
// an object that represents METHOD, LOGIC, MODEL (optional) and MIDDLEWARE (optional)

// Initial routes
var routes = {};
	
// a Route, represent a single endpoint
// Contains "/test" as the api path with method, logic and other parameters

Object.assign(routes, {
	"/test" : {
		method : 'POST', 
	    logic : 'test', 
	    // model : ['model_example'],
	    // middleware : ['middleware_example'] 
	}
});


// Export all of defined routes
module.exports = routes;