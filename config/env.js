module.exports = {
	// Api Version 
	version : '1.0',
	// Json parser configuration
	json_parser : {
		// Limit of request body size in megabyte
		// This usually helps if u transfering large amout of request
		limit: '20mb', 
		extended: true
	},
	// Defines Server Port, Default port is 8881
	port : 8881,
	// Database configuration
	// Suports only one database connection
	database :{
		// Database name
		database: "DATABASE_NAME",
		// Database host / ip address
	    host: "DATABASE_HOST",
	    // Database's port number
	    port: "DATABASE_PORT",
	    // Database username access
	    user: "DATABASE_USERNAME",
	    // Database password
	    password: "DATABASE_PASSWORD"
	},
}