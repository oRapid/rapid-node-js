module.exports = async (endpoint) => {
	// A middleware have an endpoint parameter same as logic file
	// Same as logic files, middleware should return a response, to identify if middleware is success or not
	// If return status false, it will return the object as a response
	// If return true it will continue to the requested logic file
	// Here an example of failed middleware
	return {
		status : false
	};
}