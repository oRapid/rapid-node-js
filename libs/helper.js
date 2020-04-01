var CryptoJS = require("crypto-js"), moment = require('moment');
var colors = require('colors');
var fs = require("fs");

let Helper = {
    print : {
        start : function(){
            console.log();
            console.log();
            console.log('\x1b[33m%s\x1b[1m', '- RUNNING ENDPOINT');
        },
        log : function(text, options = {}){
            console.log();
            if(typeof text === 'array'){
                var data = [
                    {
                        date :  moment().format('LL h:mm:ss'),
                        data : text
                    }
                ]
                console.table('\x1b[33m%s\x1b[1m', data);
            }else{
                console.log( 
                    options.divider ? options.divider : '-' + 
                    "- # "+ moment().format('LL h:mm:ss'). gray +" | " . gray + `${text}`. white
                );
            }
        },
        error : function(text, options = {}){
            console.log();
            console.error("-- # "+ moment().format('LL h:mm:ss'). gray +" | " . gray + `${text}`. red);
        },
        end : function(){
            console.log();
            console.log('\x1b[33m%s\x1b[1m', '- END OF ENDPOINT');
            console.log();
        }
    },
    check : {
        if : function(obj){
            return {
                includes : function(values){
                    var unmatched_values = [];
                    values.map(val => {
                        if(typeof obj == "object"){
                            if(typeof obj[val] == 'undefined'){
                                unmatched_values.push(val);
                            }
                        }else if(typeof obj == "array"){
                            if(!obj.includes(val)){
                                unmatched_values.push(val);
                            }
                        }
                    });
                    if(unmatched_values.length == 0){
                        return true;
                    }else{
                        return false;
                    }
                }
            }
        },
    },
    string : {
        random : function(length){
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    },
    integer : {
        random :  function(max){
            var minm = 0; 
            var maxm = max; 
            return Math.floor(Math.random() * (maxm - minm + 1)) + minm; 
        }
    },
    file : {
        accept_image_type : ["png", "jpg", "jpeg", "gif"],
        save_base64_file : function(params, callback){
            var is_uploaded = false, image_type = params.image_type ? params.image_type : 'png';
            var base64string = params.base64string.replace(/^data:image\/png;base64,/, "" ).replace(/^data:image\/jpg;base64,/, "" ).replace(/^data:image\/gif;base64,/, "" ).replace(/^data:image\/jpeg;base64,/, "" ), destination = params.dir ? params.dir : './app/storage/';
            var filename = params.name ? params.name + '.' + image_type : 'F_' + new Date().getTime()  + "_" + Math.random(999999).toString().substr(3)+ '.' + image_type;
            fs.writeFile( destination + filename, base64string, 'base64', async (err) => {
                return callback(err, filename);
            });
        }
    },
    asyncForEach : async function(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    hash: function(string, key = "") {
        return CryptoJS.SHA256(string);
    },
};

module.exports = Helper;
