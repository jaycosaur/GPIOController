const NanoTimer = require('nanotimer');
const timer = new NanoTimer();
const chalk = require('chalk');
const log = console.log;

let flash = undefined
let camera = undefined
log(chalk.black.bgGreen(`To run with non-default timings append the start command with additional process arguments of:\n\nnpm start CYCLE_DELAY=2s PIN_HIGH_OFFSET=500u PIN_HIGH_DURATION=200u\n`))
log(chalk.black.bgGreen(`Where unit specifiers are:\ns = seconds\nm = milliseconds\nu = microseconds\nn = nanoseconds\n`))

try {
    const Gpio = require('onoff').Gpio;
    flash = new Gpio(17, 'out');
    camera = new Gpio(22, 'out');

} catch(err) {
    log(chalk.white.bgRed("\nSCRIPT DOES NOT HAVE ACCESS TO GPIO MODULE, FALLING BACK TO CONSOLE LOGS ONLY\n"))
}

/*
    Unit specifiers are:
    s = seconds
    m = milliseconds
    u = microseconds
    n = nanoseconds
*/

let settings = {
}

failedSetup = false

toggleFlash = (value) => {flash&&flash.writeSync(value);log(chalk.black.bgCyan(`Flash pin ${value?"on":"off"}`))}
toggleCamera = (value) => {camera&&camera.writeSync(value);log(chalk.black.bgMagenta(`Camera pin ${value?"on":"off"}`))}

triggerFlash = ({highTime}) => {
    toggleFlash(true)
    timer.setTimeout(toggleFlash, false, highTime)
}

triggerCamera = ({highTime}) => {
    toggleCamera(true)
    timer.setTimeout(toggleCamera, false, highTime)
}

process.argv.slice(2).forEach((val) => {
    let v = val.split("=")
    settings = {
        ...settings,
        [v[0]]: v[1]
    }
});

const main = () => {
    let CYCLE_DELAY = settings.CYCLE_DELAY||'5s'
    let PIN_HIGH_OFFSET = settings.PIN_HIGH_OFFSET||'250u'
    let PIN_HIGH_DURATION = settings.PIN_HIGH_DURATION||'500u'


    log(chalk.yellow(`\n**** SETTINGS ****\n\nDELAY_BETWEEN_CYCLES = ${CYCLE_DELAY}\nFLASH_CAMERA_OFFSET = ${PIN_HIGH_OFFSET}\nPIN_HIGH_DURATION = ${PIN_HIGH_DURATION}`))
    log(chalk.green('\nProgram start...\n'))

    timer.setInterval(()=>{
        triggerFlash({highTime: PIN_HIGH_DURATION})
        timer.setTimeout(()=>triggerCamera({highTime: PIN_HIGH_DURATION}),'',PIN_HIGH_OFFSET)
    },'', CYCLE_DELAY)
}

!failedSetup&&main()