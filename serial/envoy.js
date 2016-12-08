var debug = require('debug')('envoy');
var request = require('request');

function valWithMultiplier(str) {
  var f = parseFloat(str); // this gets the numeric value.
  var a = str.split("</td>")[0].split(" ");
  var multiplier = a[a.length - 1];

  switch (multiplier) {
    case "kW":
      f = f * 1000;
      break;
    case "kWh":
      f = f * 1000;
      break;
    case "MWh":
      f = f * 1000000;
      break;
  }
  // debug("<<< " + a + " m:" + multiplier + " f:" + f);
  return f;
}

function lineOf(text, substring) {
  var line = 0;
  var matchedChars = 0;

  for (var i = 0; i < text.length; i++) {
    text[i] === substring[matchedChars] ? matchedChars++ : matchedChars = 0;

    if (matchedChars === substring.length) {
      return line;
    }
    if (text[i] === '\n') {
      line++;
    }
  }

  return -1;
}

exports = module.exports = {
  fetch: function(data, callback) {
    request('http://192.168.1.6/production', function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // debug(body) // Show the HTML for the Envoy's production page.
        var ln = lineOf(body, 'Currently');
        if (ln > -1) {
          var ar = body.split('\n');
          var rawvals = ar[ln].split("<td> ");
          // debug(rawvals);
          var meter = data.Meter || 0;
          var vals = {
            "Currently": valWithMultiplier(rawvals[1]),
            "Today": valWithMultiplier(rawvals[2]),
            "Week": valWithMultiplier(rawvals[3]),
            "Total": valWithMultiplier(rawvals[4]),
            "Meter": meter,
            "Timestamp": new Date().toISOString()
          };

          // debug(JSON.stringify(vals));
          console.log(JSON.stringify(vals));
          callback(vals);
        }
      }
    });
  }
}
