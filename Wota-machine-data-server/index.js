const express = require('express')
const cors = require('cors')
const app = express()
const machineData = require('./data')
app.use(cors())
app.use(express.json());


app.listen(1000, (err) => {
    if (err) {
        console.log(`Sever Is not running due to error -> ${err}`)
    } else {
        console.log('-------------------This Server Emit Data About Machines-------------------')
    }
})

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Machine Are Running',
        data: machineData,

    })
})
const DATA_UPDATE_TIME = 10000
    // const DATA_UPDATE_TIME = 150000
    //setting interval for updating machineData array after 2.5 minutes
setInterval(() => {
    const timestamp = new Date(Date.now()).toISOString()
    machineData.forEach((machine) => {
        let random = Math.random()
        if (machine.id === 3) random = 0.9
        if (random > 0.8) {
            machine.current_stop_time = (parseInt(machine.current_stop_time) + (DATA_UPDATE_TIME / 1000)).toString()
        } else {
            machine.current_run_time = (parseInt(machine.current_run_time) + (DATA_UPDATE_TIME / 1000)).toString()
        }
        machine.timestamp = timestamp
    })
    console.log('Machine Data Updated')
}, DATA_UPDATE_TIME)