// Model example
// This file contains a sets of query that connect to database
// every function needs to be an async function
module.exports = function(connection){
	return {
		get_some_data : async function(){
			// Do whatever you want with sql
			// return await connection.query();
		}
	}
}