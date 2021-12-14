const WebSocket = require('ws');
const express = require('express')
const http = require('http')
const fetch = require('node-fetch');
const mysql = require('mysql');

const app = express()
const server = http.createServer(app);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'dbname'
})

// db.connect((err) => {
//     if (err) console.log(err)
//     else console.log("Connected To DB")
// })

let connections = [] //all connection to the websockets are stored in this array

//new websocket server created
const wsServer = new WebSocket.Server({ server: server });

wsServer.on('connection', function connection(ws) {
    connections.push(ws)
    console.log('New Device Connected')

    ws.on('close', (resCode, des) => {
        connections.slice(connections.indexOf(connection), 1)
        console.log('A Device Disconnected', resCode, des)
    })
})

const sendNotificationForMachine = (machineData, status) => {
    let description = `${machineData.name} is Down for more than 5 Minutes. Please Fix it.`
    let type = 'down'

    if (status === 'functional') {
        //this means has started working we need to change type and description
        description = `${machineData.name} is Fuctional Now. Cheers !!`
        type = 'functional'
    }

    let msg = {
        "id": machineData.id,
        "type": type,
        "machine": machineData.name,
        "timestamp": Date.now(),
        "description": description
    }
    msg = JSON.stringify(msg)
        //sending data to each android device connected to the sever.
    wsServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) client.send(msg)
    })
    console.log(`Notification Send To All Device for ${machineData.name} - ${status}`)
}

//function to convert datetime string to time in 24hr format
const convertDateTimeStringToTime = (timestamp) => {
    let timeString = new Date(timestamp).toTimeString()
    timeString = timeString.split(':')
    timeString = timeString[0] + ':' + timeString[1]
    return timeString
}

let currentMachineDataApi = []
let downMachinesApi = {}
let currentMachineDataSql = []
let downMachinesSql = {}
    const API_CALL_TIME = 10000 //in milliseconds
// const API_CALL_TIME = 150000 //in milliseconds

const updateMachineData = async(obj) => {    
    
    if (obj.currentMachineData.length === 0) {
        obj.latestMachineData.forEach(machineData => {
            machineData.timestamp = convertDateTimeStringToTime(machineData.timestamp)
        })
        obj.currentMachineData = obj.latestMachineData
    } else {
        //looping through currently stored machine and comparing it with
        //incoming new data to check if a machine is working or ideal
        obj.currentMachineData.forEach((machineData, idx) => {
            const timeDiff = parseInt(obj.latestMachineData[idx].current_stop_time) - parseInt(machineData.current_stop_time)
            console.log(timeDiff, obj.latestMachineData[idx].current_stop_time, machineData.current_stop_time)
            obj.latestMachineData[idx].timestamp = convertDateTimeStringToTime(obj.latestMachineData[idx].timestamp)
            if (timeDiff >= API_CALL_TIME) {
                //this means machine is down for more than 5 minutes
                //we need to send a notification to app using websockets
                sendNotificationForMachine(obj.latestMachineData[idx], 'down') //send notification to app
                obj.latestMachineData[idx].status = "Down"
                obj.downMachines[machineData.id] = machineData.id
            } else {
                //it means our machine is active for last 5 minutes
                //we have to check if machine's down notification was send
                //our app. If yes then we have to send active notification
                if (obj.downMachines[machineData.id]) {
                    sendNotificationForMachine(obj.latestMachineData[idx], 'functional') //send notification to app
                    obj.downMachines[machineData.id] = null
                }
                obj.latestMachineData[idx].status = "Functional"
            }
        })
        obj.currentMachineData = obj.latestMachineData //finally upating machine data with latest data set
    }
}

//calling the updatedata funciton for dataset
setInterval(() => {
    getDataFromApi()
        // getDataFromSql()
}, API_CALL_TIME)


app.get('/data', (req, res) => {
    let temp = currentMachineDataApi
    currentMachineDataSql.forEach(machineData => {
        temp.push(machineData)
    })
    res.status(200).json({
        message: 'Machine Data Fetched Successfully',
        data: temp
    })
})

server.listen(5000, (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log('Server Running at Port 5000')
    }
})

const getDataFromApi = async() => {
    //fetching data from API
    //for test purpose we have a local server running at port 1000
    //that will send all data related to machine
    console.log('Fetching New Machine Data')
    const res = await fetch('http://localhost:1000')
    const data = await res.json()
    const latestMachineData = data.data

    const obj = {
        currentMachineData:currentMachineDataApi,
        downMachines:downMachinesApi,
        latestMachineData:latestMachineData
    }
    await updateMachineData(obj)
    currentMachineDataApi = obj.currentMachineData
    downMachinesApi = obj.downMachines
}

//db query
const getDataFromSql = () => {
    db.query(`SELECT ${primarykey} from ${table} ')`, (err, result) => {
        if (err) {
            console.log(err)
            reject('Failed')
        } else {
            updateMachineData(currentMachineDataSql, downMachinesSql, latestMachineData)
        }
    })
}

// id
// SDate
// Enabled
// Picks
// Status