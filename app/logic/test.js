module.exports = async (endpoint) => {
	/*  Endpoint parameters returns an object of :
		- request, 
		- response, 
		- middleware, 
		- model,
		- global,
		- helper,
		- database
	*/
	endpoint.response.send({
		status : true,
		status_code : 200,
		status_message : "It Works!"
	})
}