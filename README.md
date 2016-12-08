# AMRLogger
NodeJS Logger for AMR meter on a RaspberryPi.

I started with a Python script to read the meter which was an example program from the mfgr of the meter.
Python was slow to develop in compared to NodeJS (for me).  
To add the features I wanted to add, converted this project to NodeJS.

Install NPM, NodeJS (The current version for this is v6.9.2)
```
  npm install
```

To run:
```
  node serial/amrlogger.js
```

## PVOutput.org
Results are captured, math is performed based on scraping from my Envoy solar power output collection unit 
then results sent to PVOutput.org for nice graphing.
