const NanoTimer = require('nanotimer');
const timer = new NanoTimer();
const flashTimer = new NanoTimer();
const cameraTimer = new NanoTimer();
const cycleTimer = new NanoTimer();
const offsetTimer = new NanoTimer();

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
    log(chalk.white.bgRed("\nSCRIPT DOES NOT HAVE ACCESS TO GPIO MODULE, FALLING BACK TO SIMULATION - CONSOLE LOGS ONLY\n"))
}

let settings = {
    
}

failedSetup = false

toggleFlashOn = (value) => {
    console.log("17o")
    flash&&flash.write(value, ()=> {
        console.time('DELAY');
        console.time('17-PEAK');
        console.log("17c")
    });
}

toggleFlashOff = (value) => {
    flash&&flash.write(value, ()=> console.timeEnd('17-PEAK'));
}

toggleCameraOn = (value) => {
    console.log("22o")
    camera&&camera.write(value, ()=> {
        console.time('22-PEAK')
        console.timeEnd('DELAY')
        console.log("22c")
    });
}

toggleCameraOff = (value) => {
    camera&&camera.write(value, ()=> console.timeEnd('22-PEAK'));
}

triggerFlash = ({highTime}) => {
    toggleFlashOn(1)
    timer.setTimeout(()=>{toggleFlashOff(0)}, '', highTime)
}

triggerCamera = ({highTime}) => {
    toggleCameraOn(false)
    timer.setTimeout(()=>{toggleCameraOff(1)}, '', highTime)
}

process.argv.slice(2).forEach((val) => {
    let v = val.split("=")
    settings = {
        ...settings,
        [v[0]]: v[1]
    }
})

const main = () => {
    let CYCLE_DELAY = settings.CYCLE_DELAY||'5s'
    let PIN_HIGH_OFFSET = settings.PIN_HIGH_OFFSET||'250u'
    let PIN_HIGH_DURATION = settings.PIN_HIGH_DURATION||'50m'

    log(chalk.yellow(`\n**** SETTINGS ****\n\nDELAY_BETWEEN_CYCLES = ${CYCLE_DELAY}\nFLASH_CAMERA_OFFSET = ${PIN_HIGH_OFFSET}\nPIN_HIGH_DURATION = ${PIN_HIGH_DURATION}`))
    log(chalk.green('\nProgram start...\n'))

    cycleTimer.setInterval(()=>{
        console.time('17-PIN_LAG')
        flash.write(1, ()=> {
            console.timeEnd('17-PIN_LAG')
            console.time('DELAY');
            console.time('17-PEAK');
            flashTimer.setTimeout(()=>{flash.write(0, () => console.timeEnd('17-PEAK'));}, '', PIN_HIGH_DURATION)
            
        })
        offsetTimer.setTimeout(()=>{
            console.time('22-PIN_LAG')
            camera.write(0, ()=> {
                console.timeEnd('22-PIN_LAG')
                console.timeEnd('DELAY');
                console.time('22-PEAK');
                cameraTimer.setTimeout(()=>{camera.write(1, () => console.timeEnd('22-PEAK'));}, '', PIN_HIGH_DURATION)
            });
        },'',PIN_HIGH_OFFSET)
    },'', CYCLE_DELAY)
}

!failedSetup&&main()