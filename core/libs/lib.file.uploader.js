module.exports = function (args) {
	args.helper.print.log("Performing image upload");
	if(args.helper.check.if(args.request.body).includes(["base64string"])){
		var storage_dir = args.global.app_storage_dir + "/";
		if(args.request.body.dir != undefined){
			storage_dir = storage_dir + args.request.body.dir + "/";
		}
		args.helper.file.save_base64_file({
			image_type : args.request.body.type ? args.request.body.type : 'png',
			name  : args.request.body.filename ? args.request.body.filename : undefined,
			base64string : args.request.body.base64string,
			dir : storage_dir
		}, (err, data) => {
			if(!err){
				args.response.send({
					status : true,
					status_code : 200,
					status_code_name : "BAD_REQUEST",
					status_message : "File successfully uploaded",
					data : {
						file_name : data,
						file_path : storage_dir + data
					}
				})
			}else{
				args.helper.print.error("Failed uploading image");
				args.response.send({
					status : false,
					status_code : 400,
					status_code_name : "FAILED_FILE_UPLOAD",
					status_message : "Failed while trying to upload file"
				})
			}
		});
	}else{
		args.helper.print.error("Failed uploading image");
		args.response.send({
			status : false,
			status_code : 400,
			status_code_name : "BAD_REQUEST",
			status_message : "Missing parameter (base64string) on your body requestuest"
		})
	}
}