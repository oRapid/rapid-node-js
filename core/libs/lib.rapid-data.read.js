// This code / functionality still in development
module.exports = async function (args) {
	if(args.helper.check.if(args.request.body).includes(["table"])){
		var 
			$tbl = args.request.body.table,
			$tbl_fields = args.request.body.fields != undefined ? args.request.body.fields : ["*"],
			$tbl_join = args.request.body.join != undefined ? args.request.body.join : null,
			$tbl_condition = args.request.body.condition != undefined ? args.request.body.condition : '';
		var query = await args.database.query(`SELECT ${$tbl_fields.join(", ")} FROM ${$tbl}`);
		args.response.send({
			status : true,
			status_code : 200,
			status_code_name : "SUCCESS_REQUEST",
			data : query
		})
	}else{
		args.helper.print.error("Failed uploading image");
		args.response.send({
			status : false,
			status_code : 400,
			status_code_name : "BAD_REQUEST",
			status_message : "Missing parameter on your body requestuest"
		})
	}
}