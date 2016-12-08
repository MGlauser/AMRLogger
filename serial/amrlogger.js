var debug = require('debug')('amrlogger');
var sleep = require('sleep');
var serialport = require('serialport');
var logMe = require('./logMe');
var last_update = 0;

logMe.init(function() {});

var SerialPort = serialport;
var sp = new SerialPort("/dev/ttyAMA0", {
  baudrate: 115200,
  databits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false,
  parser: serialport.parsers.readline("\n"),
});

sp.on('open', function() {
  console.log("Setting mode 1");
  sp.write("\n");
  sp.flush();
  sleep.sleep(1); // 1 second.
  sp.write("MODE 1\n");
  sp.flush();
  sleep.sleep(1);
});

sp.on('data', function(data) {
  var unixSeconds = parseInt(new Date().getTime() / 1000);
  var test_age = (unixSeconds - last_update) > 2; // 10 seconds

  var test1 = (data.indexOf("UMSCM") > 0);
  var test2 = (data.indexOf('56464686') > 0);
  // var test2 = new RegEx(/8/); // only for debugging

  console.log('data received: ' + data + "\n");
  if (test_age) {
    if (test1 && test2) {
      var meter = data.split(',')[2];
      debug("calling logMe.do() ", meter);
      logMe.do({ "Meter": meter });
      last_update = unixSeconds;
    }
  } else {
    console.log("Skipping doublet transmission.");
  }

});
