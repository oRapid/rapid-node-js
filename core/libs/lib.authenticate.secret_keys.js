var fs = require('fs');
module.exports = async function (args) {
	try {
		var secret_keys = JSON.parse(fs.readFileSync(args.global.base_dir + '/secret_key.json'));
		if(secret_keys.length > 0){
			if(typeof args.request.headers['accept-api-secret-key'] != 'undefined'){
				args.helper.print.log('Checking & Authenticating Secret keys...');
				var is_authenticated = false;
				// Perform api authentication
				// Loop through every secret keys in the /secret_keys.json file
				await secret_keys.map(secret_key => {
					// Check wether the requestuested header of accept-api-secret-key is matches with any keys inside the json file
					if(args.request.headers['accept-api-secret-key'] == secret_key.key){
						args.helper.print.log('Authenticated with secret key name ' + `${secret_key.name}`.cyan);
						// Set the authenticated state to true
						// To let the user access endpoint
						is_authenticated = true;
					}else{
						// Forbid user for accessing the endpoint
						is_authenticated = false;
					}
				});
				return is_authenticated;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}catch(e){
		return false;
	}
	
}