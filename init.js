// rapid-node-js
// Created by Royan Zain
// October 28th 2019
// And here we go...

// And Oh, Normaly you wouldn't have to edit any of these code below
var express = require("express"), 
	path = require('path'), 
	app = express(), 
	env = require("./config/env"), 
	bodyParser = require("body-parser"), 
	helper = require("./libs/helper"), 
	router = express.Router(),
	colors = require('colors'), 
	core_router = require('./core/router'); 

// Use body parser
app.use(bodyParser.json(env.json_parser));

// Use the router
app.use("/", router);

// Bunch of stuff happens below
core_router(router, require('./global'));

// Start the server
app.listen(env.port, () =>
	helper.print.log('Starting ' + 'rapid-node-js'.cyan + ' api server on port '.white + `${env.port}` .cyan)
);
