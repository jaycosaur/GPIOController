var express = require('express')
const chalk = require('chalk');

var config = require('./config')
var CameraTrigger = require('./CameraTrigger')
var gpsd = require('node-gpsd')


const farTrigger = new CameraTrigger({pin: config.FAR_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const closeTrigger = new CameraTrigger({pin: config.CLOSE_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const truckTrigger = new CameraTrigger({pin: config.TRUCK_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})

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
    console.log('Connected');
});

if(listener.isConnected()){
    listener.watch()
    listener.on('TPV', (res)=>{
        GPS_RESULTS = res
    })
}

app.get('/trigger-far', async function (req, res) {
    await farTrigger.trigger(()=>res.send('OK'))
})

app.get('/trigger-close', async function (req, res) {
    await closeTrigger.trigger(()=>res.send('OK'))
})

app.get('/trigger-truck', async function (req, res) {
    await truckTrigger.trigger(()=>res.send('OK'))
})

app.get('/gps-coords', function (req, res) {
    console.log(GPS_RESULTS)
   res.send(GPS_RESULTS)
})

app.get('/status', function (req, res) {
    res.send(new Date().toISOString())
 })
 
app.listen(config.SERVER_PORT, config.HOST, ()=>{
    console.log(chalk.yellow(`Listening on ${config.HOST}:${config.SERVER_PORT}`))
})