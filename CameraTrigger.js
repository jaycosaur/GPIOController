const NanoTimer = require('nanotimer');
const log = console.log;

class MockTrigger {
    constructor(pin, direction){

    }
    write(input, cb){
        cb(false)
    }
}

class CameraTrigger {
    constructor({pin, pinHighDuration, inverse=false}){
        try {
            const Gpio = require('onoff').Gpio;
            this.trig = new Gpio(pin, 'out');
        }
        catch (e) {
            log("SCRIPT DOES NOT HAVE ACCESS TO GPIO MODULE, FALLING BACK TO SIMULATION - CONSOLE LOGS ONLY")
            console.log(e)
            this.trig = new MockTrigger(pin, 'out');
        }
        this.timer = new NanoTimer()
        this.pinHighDuration = pinHighDuration
        this.inverse = inverse
    }

    trigger(cb) {
        return this.trig.write(this.inverse?0:1, (state)=> {
            console.log(state===false?"MOCK":"PIN")
            this.timer.setTimeout(()=>{this.trig.write(this.inverse?1:0, () => cb())}, '', this.pinHighDuration)
        })
    }
}

module.exports = CameraTrigger