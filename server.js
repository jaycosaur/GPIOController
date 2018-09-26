var express = require('express')
const chalk = require('chalk');

var config = require('./config')
var CameraTrigger = require('./CameraTrigger')
var gpsd = require('node-gpsd')
var path = require('path');

const farTrigger = new CameraTrigger({pin: config.FAR_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const closeTrigger = new CameraTrigger({pin: config.CLOSE_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const truckTrigger = new CameraTrigger({pin: config.TRUCK_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const farTriggerFlash = new CameraTrigger({pin: config.FAR_TRIGGER_PIN_WITH_FLASH, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const closeTriggerFlash = new CameraTrigger({pin: config.CLOSE_TRIGGER_PIN_WITH_FLASH, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const truckTriggerFlash = new CameraTrigger({pin: config.TRUCK_TRIGGER_PIN_WITH_FLASH, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})

console.log("FAR: ",  config.FAR_TRIGGER_PIN)
console.log("CLOSE: ",  config.CLOSE_TRIGGER_PIN)
console.log("TRUCK: ",  config.TRUCK_TRIGGER_PIN)

console.log("FAR FLASH: ",  config.FAR_TRIGGER_PIN_WITH_FLASH)
console.log("CLOSE FLASH: ",  config.CLOSE_TRIGGER_PIN_WITH_FLASH)
console.log("TRUCK FLASH: ",  config.TRUCK_TRIGGER_PIN_WITH_FLASH)

var app = express()

const logger = (req, res, next) => {
    console.log(chalk.green(`${new Date().toISOString()} - Recieved Request at ${req.path}`))
    next()
}

app.use(logger)

let GPS_RESULTS = undefined

var listener = new gpsd.Listener({
    port: 2947,
    hostname: 'localhost',
    logger:  {
        info: function() {},
        warn: console.warn,
        error: console.error
    },
    parse: true
});

listener.connect(function() {
    console.log('GPS IS CONNECTED');
    listener.watch()
    listener.on('TPV', (res)=>{
        GPS_RESULTS = res
    })
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/trigger-far', async function (req, res) {
    await farTrigger.trigger(()=>res.send("OK"))
})

app.get('/trigger-close', async function (req, res) {
    await closeTrigger.trigger(()=>res.send("OK"))
})

app.get('/trigger-truck', async function (req, res) {
    await truckTrigger.trigger(()=>res.send("OK"))
})

app.get('/trigger-far-flash', async function (req, res) {
    await farTriggerFlash.trigger(()=>res.send("OK"))
})

app.get('/trigger-close-flash', async function (req, res) {
    await closeTriggerFlash.trigger(()=>res.send("OK"))
})

app.get('/trigger-truck-flash', async function (req, res) {
    await truckTriggerFlash.trigger(()=>res.send("OK"))
})

app.get('/trigger-all', async function (req, res) {
    await farTrigger.trigger(()=>null)
    await closeTrigger.trigger(()=>null)
    await truckTrigger.trigger(()=>null)
    res.send('done')
})

app.get('/trigger-all-flash', async function (req, res) {
    await farTriggerFlash.trigger(()=>null)
    await closeTriggerFlash.trigger(()=>null)
    await truckTriggerFlash.trigger(()=>null)
    res.send('done')
})

app.get('/gps-coords', function (req, res) {
   res.send(GPS_RESULTS)
})

app.get('/status', function (req, res) {
    res.send(new Date().toISOString())
 })
 
app.listen(config.SERVER_PORT, config.HOST, ()=>{
    console.log(chalk.yellow(`Listening on ${config.HOST}:${config.SERVER_PORT}`))
})