// This calls the Enovy scraper and logs
//    current meter and Envoy readings to Sqlite3 database
var debug = require('debug')('logMe');
var envoy = require('./envoy');
var record = require('./record');
var pvoutput = require('./pvoutput');

exports = module.exports = {
  init: function(callback) {
    callback(null);
  },

  do: function(data) {
    console.log("in do(data): " + JSON.stringify(data));
    envoy.fetch(data, function(vals){
      record.saveTable(vals, function(exportables){
        console.log("in do(data), saveTable exportables: ", JSON.stringify(exportables));

        if (typeof(exportables) !== "undefined") {
          console.log("Consumption: ", JSON.stringify(exportables));

          pvoutput.send(exportables, function(error, response, body){
            debug("Error, Response, Body:");
            debug(error);
            debug(response);
            debug(body);
          });
        }
      });
    });
  }
};
