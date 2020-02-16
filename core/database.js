// Database Helper module by Royan Zain 
// Used for easily connect and do some database stuff
// Created at october 28th 2019
// Version : v.1.0
// System Requires package : mysql2

const util = require('util'), 
	mysql = require('mysql'), helper = require("../libs/helper"),
	db_config = require("../config/env").database,
	colors = require('colors'),
	pool = mysql.createPool(db_config);

helper.print.log("Establishing database connection");

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  	if (err) {
	    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
	      helper.print.log('Database connection was closed.'.red)
	    }
	    if (err.code === 'ER_CON_COUNT_ERROR') {
	      helper.print.log('Database has too many connections.'.red)
	    }
	    if (err.code === 'ECONNREFUSED') {
	      helper.print.log('Database connection was refused.'.red)
	    }
  	}else{
		helper.print.log(`Database '${db_config.database}' Connected`.green);
  	}
  	console.log();
  	if (connection) connection.release()
  	return
});


// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

var DatabaseHelper = { 
	query_str : '',
	inserted_id : null,
	limit : 10,
	execute : function(){
		helper.print.log(`Running MySQL Query '`.green + this.query_str + "'".green);
		return pool.query(DatabaseHelper.query_str);
	},
	set_limit : function(limit){
		DatabaseHelper.limit = limit;
	},
	raw : function(sqlQuery){
		helper.print.log(`Running MySQL Query '`.green + sqlQuery + "'".green);
		return pool.query(sqlQuery);
	},
	insert : {
		into : function(table){
			return {
				values : async function (values, returns_id = false) {
					var vals = '', keys = '';
					Object.keys(values).forEach(key => {
						keys += key +", ";
						if(key == 'id' && key != '' && key != undefined){
							vals += "'" + values[key] + "', ";
						}else{
							vals += "'" + values[key] + "', ";
						}
					});
					vals = vals.substr(0, vals.length - 2), keys = keys.substr(0, keys.length - 2);
					DatabaseHelper.query_str = `INSERT INTO ${table} (${keys})  VALUES(${vals})`;
					var execute = await DatabaseHelper.execute();
					if(execute.affectedRows > 0){
						if(returns_id == true){
							return execute.insertId;
						}else{
							return true;
						}
					}else{
						return false;
					}
				}
			}
		}
	},
	expose : function(fields){
		DatabaseHelper.query_str = `SELECT ${fields.join(", ")} `;
		return {
			from : function(table, join_table = []){
				DatabaseHelper.query_str += ' FROM ' + table + ' ';
				if(join_table.length > 0){
					join_table.map(join => {
						DatabaseHelper.query_str += ` INNER JOIN ${join.table} ON ${join.where} `;
					});
				}
				return {
					get : function(){
						return DatabaseHelper.execute();
					},
					page : function(page){
						var limit = DatabaseHelper.limit;
						var offset = (page - 1) * limit;
						DatabaseHelper.query_str += ` LIMIT ${limit} OFFSET ${offset} `;
						return {
							get : function(){
								return DatabaseHelper.execute();
							}
						}
					},
					sort_by : function(by, increment = ''){
						DatabaseHelper.query_str += ` ORDER BY ${by} ${increment} `;
						return {
							get : function(){
								return DatabaseHelper.execute();
							},
							page : function(page){
								var limit = DatabaseHelper.limit;
								var offset = (page - 1) * limit;
								DatabaseHelper.query_str += ` LIMIT ${limit} OFFSET ${offset} `;
								return {
									get : function(){
										return DatabaseHelper.execute();
									}
								}
							},
						}
					},
					where : function(conditions = {}){
						if(Object.keys(conditions).length > 0){
							var conds = [];
							Object.keys(conditions).forEach(condition => {
								conds.push(`${condition} = '${conditions[condition]}' `);
							});
							DatabaseHelper.query_str += "WHERE " + conds.join(' AND ');
						}
						return {
							get : function(){
								return DatabaseHelper.execute();
							},
							page : function(page){
								var limit = DatabaseHelper.limit;
								var offset = (page - 1) * limit;
								DatabaseHelper.query_str += ` LIMIT ${limit} OFFSET ${offset} `;
								return {
									get : function(){
										return DatabaseHelper.execute();
									}
								}
							},
						}
					}
				}
			}
		}
	},
	delete : {
		from : function(table){
			DatabaseHelper.query_str = `DELETE FROM ${table}`;
			return {
				where : function(conditions = {}){
					if(Object.keys(conditions).length > 0){
						var conds = [];
						Object.keys(conditions).forEach(condition => {
							conds.push(`${condition} = '${conditions[condition]}' `);
						});
						DatabaseHelper.query_str += " WHERE " + conds.join(' AND ');
					}
					return {
						limit : function (limit){
							DatabaseHelper.query_str += " LIMIT " + limit;
							return {
								execute: function(){
									return DatabaseHelper.execute();
								}
							}
						},
						execute: function(){
							return DatabaseHelper.execute();
						}
					}
				},
				limit : function (limit){
					DatabaseHelper.query_str += " LIMIT " + limit;
					return {
						execute: function(){
							return DatabaseHelper.execute();
						}
					}
				},
				execute: function(){
					return DatabaseHelper.execute();
				}
			}
		}
	},
	update : function(table){
		DatabaseHelper.query_str = `UPDATE ${table}`;
		return {
			set : function(data){
				if(Object.keys(data).length > 0){
					var data_sets = [];
					Object.keys(data).forEach(key => {
						data_sets.push(`${key} = '${data[key]}' `);
					});
					DatabaseHelper.query_str += " SET " + data_sets.join(',');
				}
				return {
					execute : async function(){
						const execute = await DatabaseHelper.execute();
						if(execute.affectedRows > 0){
							return true;
						}else{
							return false;
						}
					},
					where : function(conditions){
						if(Object.keys(conditions).length > 0){
							var conds = [];
							Object.keys(conditions).forEach(condition => {
								conds.push(`${condition} = '${conditions[condition]}' `);
							});
							DatabaseHelper.query_str += " WHERE " + conds.join(' AND ');
						}
						return {
							execute : async function(){
								const execute = await DatabaseHelper.execute();
								if (execute.affectedRows > 0){
									return true;
								}else{
									return false;
								}
							}
						}
					}
				}
			}
		}
	}
}

module.exports = async () => {
	let connection = await pool;
	// Assign wether database is connected or not
	// Assign Database helper
	await Object.assign(pool, DatabaseHelper);
	// Returns connection
 	return connection;
}