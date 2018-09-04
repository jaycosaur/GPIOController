var express = require('express')
const chalk = require('chalk');

var config = require('./config')
var CameraTrigger = require('./CameraTrigger')

const farTrigger = new CameraTrigger({pin: config.FAR_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const closeTrigger = new CameraTrigger({pin: config.CLOSE_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})
const truckTrigger = new CameraTrigger({pin: config.TRUCK_TRIGGER_PIN, pinHighDuration: config.PIN_HIGH_DURATION, inverse: false})

var app = express()

const logger = (req, res, next) => {
    console.log(chalk.green(`${new Date().toISOString()} - Recieved Request at ${req.path}`))
    next()
}

app.use(logger)
 
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
   res.send('Hello World')
})

app.get('/status', function (req, res) {
    res.send('OK')
 })
 
app.listen(8080, "localhost",()=>{
    console.log(chalk.yellow("Listening on localhost:8080"))
})