let 
	routes = require('../config/routes'), 
	path = require('path'),
	env = require('../config/env'), 
	helper = require("../libs/helper"), 
	fs = require('fs');

// Initial routes
Object.assign(routes, {
	'/' : {},
	'/storage/*' : {},
	'/file/upload' : { method : "POST"},
})

// Start routing
module.exports = async function(router, global){
	// Loop through every routes in the app/config/routes file
	Object.keys(routes).forEach(async $route => {
		// Get the route method
		var $route_method = routes[$route].method ? routes[$route].method : "GET", 
			// defines the route logic
			$route_logic = routes[$route].logic, 
			// Use Database connection
			$route_is_use_database = routes[$route].database ? routes[$route].database : false, 
			// defines the route model and set to empty array if theres none
			$route_model = routes[$route].model ? routes[$route].model : [], 
			// defines route's middlewares
			$route_middleware = routes[$route].middleware ? routes[$route].middleware : [];

		// Check if theres any object database set to true, means that every endpoint visited is requires a database connection
		// That user will need to configure in /config/env.js file
		if($route_is_use_database == true){
			// Call database connection..
			var $database_connection = await require(global.base_dir + "/core/database")();
		}

		// Run through the router
		await router[$route_method.toLowerCase()]($route, async function(req, res, next) { 
			// Defines endpoint parameters, these are the parameters that can be used in each endpoint by accessing an object
			var $route_endpoint_arguments = {
				global : global,
				request : {
					require : function (values) {
						if(helper.check.if(req.body).includes(values)){
							return true;
						}else{
							return false;
						}
					},
					params : req.params,
					headers : req.headers,
					raw_headers : req.raw_headers,
					query : req.query,
					body : req.body
				},
				response : {
					send : function (params) {
						// Send Reponse
						res.send(params);
					}
				},
				model : {},
				middleware : {},
				helper : helper
			};

			// Check if route use a database connection, if so append database connection to parameter
			if($route_is_use_database == true){
				await Object.assign($route_endpoint_arguments, {
					database : $database_connection
				});
			}

			// If base url accessed
			if($route == "" || $route == "/"){ 
				res.sendFile(global.base_dir + '/index.html');	
			}else if($route == "storage/*" || $route == "/storage/*"){
				// If access a public storage
				try {
				  	if (fs.existsSync(global.app_storage_dir + "/" + Object.values(req.params).join("/"))) {
				    	//file exists
						res.sendFile(global.app_storage_dir + "/" + Object.values(req.params).join("/"));	
				  	}else{
				  		res.send(404, 'FILE NOT FOUND');
				  	}
				} catch(err) {
				  	res.send(404, err);
				}
			}else if($route == "file/upload" || $route == "/file/upload"){
				var $authenticate_secret_keys =  require('./libs/lib.authenticate.secret_keys');
				$authenticate_secret_keys = await $authenticate_secret_keys($route_endpoint_arguments);
				if( $authenticate_secret_keys == true ){
					return require('./libs/lib.file.uploader')($route_endpoint_arguments);
				}else{
					res.status(401).send({
						status : false,
						status_code : 401,
						status_code_name : 'UNAUTHORIZED_ACCESS',
						status_message : 'You don\'t have an authorization to access this endpoint, Check your (accept-api-secret-key) header'
					});
				}
			// Route that defined in the /config/routes file
			}else{
				// Checking secret key
	            console.log("--".cyan);
				// Set the initial authentication state to false
				// to indicates that every endpoint that is visited
				let is_authenticated = false;
				// Check if theres any header refers to secret key which is accept-api-secret-key
				var $authenticate_secret_keys =  require('./libs/lib.authenticate.secret_keys');
				$authenticate_secret_keys = await $authenticate_secret_keys($route_endpoint_arguments);
				if( $authenticate_secret_keys == true ){
					// Defines if middleware passed, set to true for default
					let $is_middleware_passed = true, $middleware_response;	

					// _Model
					// Appending predefined route model to the logic
					// predefined model is a parameter that can be passed in the /config/routes file
					// Tho it is not mandatory, but if theres any model passed in the route object
					if($route_model.length > 0){
						// Loop thru every model in route
						await helper.asyncForEach( $route_model, async $model => {
							// Append it to endpoint parameters
							await Object.assign($route_endpoint_arguments.model, {
								// Call the model with parametes passed
								[$model] : await require( global.app_model_dir +'/' + $model)($route_endpoint_arguments.database)
							});
						});
					}

					// _Middleware
					// Running middleware
					// Check if a router has middleware setted in app/middleware/ directory
					if($route_middleware.length > 0){
						// Loop thru passed middleware in a route
						await helper.asyncForEach( $route_middleware, async $middleware => {
							// Call middleware with some parameters
							var call_middleware = await require(global.app_middleware_dir + '/' + $middleware)($route_endpoint_arguments);
							// if middleware returns status true
							// Means that is condition is true
							if(call_middleware.status == true){
								// And check if theres any element or object data return
								// This data will be passed and append to endpoint parameter
								if(typeof call_middleware.data != undefined){
									// Assign data to middleware data object
									Object.assign($route_endpoint_arguments.middleware, {
										[$middleware] : call_middleware.data
									});
								}
							}else{
								// Failed performing middleware
								$is_middleware_passed = false;
								// Set the middlewar response
								$middleware_response = call_middleware;
							}
						});
					}

					// _Logic / Controller
					// If middleware all passed or doesnt have any
					if($is_middleware_passed === true){
						helper.print.log("Running Route : " + `${$route}`.cyan);
						// Runs the logic controller
						if(typeof $route_logic == 'function'){
							// Run logic as a function defined in the routes
							return await $route_logic(arguments);
						}else{
							// Run logic as it defined from a file inside /app/logic/ directory
							try{
								// Check for api version header
								// If version header passed
								if($route_endpoint_arguments.request.headers['accept-api-version'] != undefined ){
									// Try to call the logic file
									try {
										return await require(global.app_logic_dir + '/' + $route_logic)[$route_endpoint_arguments.request.headers['accept-api-version'] != undefined ? $route_endpoint_arguments.request.headers['accept-api-version'] : 'default']($route_endpoint_arguments);
									}catch(e){
										// If its failed, that means the logic object is not correctly structure
										res.status(404).send({
											status : false,
											status_code : 404,
											status_code_name : 'LOGIC_FILE_INCORRECT_VERSION_STRUCTURE',
											status_message : 'Make sure your logic file is correctly sturucted if you have a version header'
										});
									}
								}else{
									try {
										return await require(global.app_logic_dir + '/' + $route_logic)($route_endpoint_arguments);
									}catch(e){
										res.status(404).send({
											status : false,
											status_code : 404,
											status_code_name : 'LOGIC_FILE_INCORRECT_STRUCTURE',
											status_message : 'Make sure your logic file is correctly sturucted'
										});
									}
								}
							}catch(err){
								if(err.code == "MODULE_NOT_FOUND"){
									helper.print.error(err);
									res.status(404).send({
										status : false,
										status_code : 404,
										status_code_name : 'LOGIC_FILE_NOT_EXIST',
										status_message : err.code
									});
								}else{
									helper.print.error(err);
								}
							}
						}
						console.log('');
					}else{
						// Send response if middleware fails
						res.send($middleware_response);
					}
				}else{
					res.status(401).send({
						status : false,
						status_code : 401,
						status_code_name : 'UNAUTHORIZED_ACCESS',
						status_message : 'You don\'t have an authorization to access this endpoint, Check your (accept-api-secret-key) header'
					});
				}
			}
		});
	});
}