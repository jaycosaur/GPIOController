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
let DELAY_MODE = 'delay'
let DELAY_AMOUNT = 100

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

app.get('/toggle-close-mode/delay', async function (req, res) {
    DELAY_MODE = 'delay'
    res.send(DELAY_MODE)
})

app.get('/toggle-close-mode/calc', async function (req, res) {
    DELAY_MODE = 'calc'
    res.send(DELAY_MODE)
})

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/trigger-far', async function (req, res) {
    farTrigger.trigger(()=>console.log(chalk.blue("TRIGGERED FAR")))
    res.send("OK")
})

app.get('/trigger-close', async function (req, res) {
    await closeTrigger.trigger(()=>res.send("OK"))
})

app.get('/trigger-truck', async function (req, res) {
    await truckTrigger.trigger(()=>res.send("OK"))
})

app.get('/trigger-far-flash', async function (req, res) {
    farTriggerFlash.trigger(()=>console.log(chalk.blue("TRIGGERED FAR WITH FLASH")))
    res.send("OK")
})

app.get('/trigger-close-flash', async function (req, res) {
    /* if (DELAY_MODE === "delay"){
        setTimeout(()=>closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH")),2000)
    } else {
        closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH"))
    } */
    closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH"))
    res.send("OK")
})

app.get('/trigger-truck-flash', async function (req, res) {
    truckTriggerFlash.trigger(()=>console.log(chalk.blue("TRIGGERED FAR WITH FLASH")))
    /* if (DELAY_MODE === "delay"){
        setTimeout(()=>closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH")),DELAY_AMOUNT)
    } else {
        closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH"))
    } */
    res.send("OK")
})

app.get('/trigger-truck-flash/:delay', async function (req, res) {
    truckTriggerFlash.trigger(()=>console.log(chalk.blue("TRIGGERED FAR WITH FLASH")))
    const delay = int(req.params.delay)
    if (DELAY_MODE === "delay"){
        setTimeout(()=>closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH")),(delay/57)*DELAY_AMOUNT)
    } else {
        closeTriggerFlash.trigger(()=>console.log("TRIGGERED CLOSE WITH FLASH"))
    }
    res.send("OK")
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