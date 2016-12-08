// Record values into Sqlite3 database.
var sqlite3 = require('sqlite3').verbose();

exports = module.exports = {
  saveTable: function(vals, callback) {
    var db = new sqlite3.Database('envoy.db');
    var results;
    var rows = [];

    db.serialize(function() {
      console.log("in saveTable() vals: " + typeof(vals));
      console.log(JSON.stringify(vals));

      // Save Envoy values:
      var unixMillies = parseInt(new Date(Date.parse(vals.Timestamp)).getTime() / 1000);
      db.run("INSERT INTO Envoy(Current, Today, Total, created_at) VALUES(?, ?, ?, ?)", [vals.Currently, vals.Today, vals.Total, unixMillies]);

      // Save Meter values:
      if (vals.Meter > 0) {
        db.run("INSERT INTO Meter(Value, created_at) VALUES(?, ?)", [vals.Meter, unixMillies]);
      }

      // get values from start of day.
      var startOfDay = new Date().setHours(0, 0, 0, 0) / 1000;
      db.get("SELECT e.Today, m.Value, m.created_at FROM Envoy as e LEFT JOIN Meter as m on e.created_at = m.created_at WHERE m.created_at >= ? Order By e.created_at ASC LIMIT 1", [startOfDay], function(err, row) {
        if (!err && row) {
          rows.push(row);
        }
      });

      // get latest values.
      db.get("SELECT e.Today, m.Value, m.created_at FROM Envoy as e LEFT JOIN Meter as m on e.created_at = m.created_at Order By e.created_at DESC LIMIT 1", function(err, row) {
        if (!err && rows.length == 1 && row) {
          rows.unshift(row); // most recent is [0]
          if (rows[0].created_at != rows[1].created_at) {
            console.log("Selected rows: ", JSON.stringify(rows));

            // calculate consumption
            results = {
              timestamp: rows[0].created_at,
              net: (rows[0].Value - rows[1].Value) * 1000,  // Meter readings are in KWh, but ouput is in Wh so * 1000
              output: (rows[0].Today - rows[1].Today)
            };
            // Consumption = Output + Net;
            results.consumption = (results.output + results.net);
            console.log("results: ", JSON.stringify(results));
            callback(results);
          }

        } else {
          callback(results); // returning undefined because they are same record.
        }
      });
    });
    db.close();
  }
};
