var debug = require('debug')('export');
var request = require('request');

var toLocalTime = function(time) {
  var d = new Date(time);
  var offset = (new Date().getTimezoneOffset() / 60) * -1;
  var n = new Date(d.getTime() + offset);
  return n;
};

exports = module.exports = {
  send: function(data, callback) {
    console.log("in pvoutput.send(): data", data);
    var localtime = toLocalTime(new Date(data.timestamp * 1000));
    var dateStr = localtime.getFullYear() + ('0' + (localtime.getMonth() + 1)).slice(-2) + ('0' + localtime.getDate()).slice(-2);
    var timeStr = ('0' + (localtime.getHours())).slice(-2) + ':' + ('0' + localtime.getMinutes()).slice(-2);
    var formBody = "d=" + dateStr + "&t=" + timeStr;
    if (data.consumption > 0) {
      formBody = formBody + "&v3=" + data.consumption; // Energy Consumption value
    } else if (data.consumption < 0) {
      formBody = formBody + "&v1=" + (data.consumption * -1); // Energy Generation value
    } else {
      return callback(false, {}, "no data to send.");
    }

    console.log("in pvoutput.send(): formBody", formBody);

    // if (false) {
    request.post({
      url: 'http://pvoutput.org/service/r2/addstatus.jsp',
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Pvoutput-Apikey": "e46ce30a5753f72f9ad901e2452eb6c2a17e1996",
        "X-Pvoutput-SystemId": "48417"
      },
      body: formBody
    }, function(error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          debug(body)
        } else {
          console.error("ERROR sending to PVOUT: ", error, '\n', response.statusCode, '\n', body);
        }
      } catch (e) {}
      callback(error, response, body);
    });
    // }
  }
};
