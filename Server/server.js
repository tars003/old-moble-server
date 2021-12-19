const WebSocket = require('ws');
const express = require('express')
const http = require('http')
const fetch = require('node-fetch');
const mysql = require('mysql');

// const API_URL = "http://localhost:1000"
const API_URL = "http://192.168.0.107:81/wmsnew/api"

const app = express()
const server = http.createServer(app);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'LODA_LAKSHMI',
    password: 'LODA',
    database: 'lakshmiloom'
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
    let description = `${machineData.name} is Down. Please Fix it.`
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
let timeDiffOfMachine = {}
const API_CALL_TIME = 1000 //in milliseconds
const MACHINE_DOWN_TIME = 60 //in seconds


const updateMachineData = async(obj) => {    
    
    if (obj.currentMachineData.length === 0) {
        obj.latestMachineData.forEach(machineData => {
            machineData.timestamp =  machineData.time_stamp
            machineData.time_stamp = convertDateTimeStringToTime(machineData.time_stamp)
            timeDiffOfMachine[machineData.id] = 0
        })
        obj.currentMachineData = obj.latestMachineData
    } else {
        //looping through currently stored machine and comparing it with
        //incoming new data to check if a machine is working or down
        obj.currentMachineData.forEach((machineData, idx) => {

            const MACHINE_API_CALL_TIME =( new Date(obj.latestMachineData[idx].time_stamp) - new Date(machineData.timestamp))/1000
            obj.latestMachineData[idx].timestamp =  obj.latestMachineData[idx].time_stamp                
            obj.latestMachineData[idx].time_stamp = convertDateTimeStringToTime(obj.latestMachineData[idx].time_stamp)
            obj.latestMachineData[idx].status = machineData.status

            if(MACHINE_API_CALL_TIME === 0){
                // do nothing
            }

            else{
                const timeDiffDown = parseInt(obj.latestMachineData[idx].current_stop_time) - parseInt(machineData.current_stop_time)
                const timeDiffUp = parseInt(obj.latestMachineData[idx].current_run_time) - parseInt(machineData.current_run_time)

                console.log(obj.latestMachineData[idx].name,timeDiffDown,timeDiffUp,MACHINE_API_CALL_TIME)
                
                if (timeDiffDown >= MACHINE_API_CALL_TIME || timeDiffUp === 0) {
                    //this means machine is down 
                    //we need to send a notification to app using websockets
                    if (!obj.downMachines[machineData.id]) {
                        sendNotificationForMachine(obj.latestMachineData[idx], 'down') //send notification to app
                        obj.latestMachineData[idx].status = "Down"
                        obj.downMachines[machineData.id] = machineData.id
                    }  
                } else if(timeDiffUp >= MACHINE_API_CALL_TIME && timeDiffDown === 0){
                    //it means our machine is active
                    //we have to check if machine's down notification was send
                    //our app. If yes then we have to send active notification
                    if (obj.downMachines[machineData.id]) {
                        sendNotificationForMachine(obj.latestMachineData[idx], 'functional') //send notification to app
                        obj.downMachines[machineData.id] = null
                    }
                    obj.latestMachineData[idx].status = "Functional"                    
                }                
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
        let flag = true
        currentMachineDataApi.forEach(data => {
            if(data.id === machineData.id) {
                flag = false
            }
        })
        if(flag)temp.push(machineData)
    })
    res.status(200).json({
        message: 'Machine Data Fetched Successfully',
        data: temp
    })
})

server.listen(5001, (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log('Server Running at Port 5001')
    }
})

const getDataFromApi = async() => {
    //fetching data from API
    //for test purpose we have a local server running at port 1000
    //that will send all data related to machine
    console.log('Fetching New Machine Data')
    const res = await fetch(API_URL)
    const data = await res.json()
    const latestMachineData = data.data
    // const latestMachineData = data

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
const getDataFromSql = async() => {
    db.query(`SELECT t1.mcno as id,t1.rtime as current_run_time,(t1.sstime+t1.lstime) as current_stop_time,t2.scode as error_code, t2.duration as stop_time FROM curpord as t1 INNER JOIN curstop as t2 ON t1.mcno = t2.mcno`, async(err, result) => {
        if (err) {
            console.log(err)
            reject('Failed')
        } else {
            let latestMachineData = []

            const time_stamp = new Date(Date.now()).toISOString()
            result.forEach(data => {
                data = JSON.stringify(data)
                data.name = `Machine-${data.id}`
                data.rpm = '200'
                data.time_stamp = time_stamp
                data.efficiency = (Math.round((data.current_run_time / (data.current_run_time+data.current_stop_time))*10000))/100
                latestMachineData.push(data)
            })
            const obj = {
                currentMachineData:currentMachineDataSql,
                downMachines:downMachinesSql,
                latestMachineData:latestMachineData
            }
            await updateMachineData(obj)
            currentMachineDataSql = obj.currentMachineData
            downMachinesSql = obj.downMachines
        }
    })
}

// SELECT t1.mcno as name,t1.rtime as current_run_time,(t1.sstime+t1.lstime) as current_stop_time
// from curprod as t1 INNER JOIN
// (SELECT id,mcno as name, max(sstime+lstime) as current_stop_time FROM curprod GROUP BY mnco) as t2
// ON t1.current_stop_time=t2.current_stop_time and t1.name=t2.name  //Subquery 1

// SELECT t1.mcno as name,t1.scode as error_code,t1.duration
// from curstop as t1 INNER JOIN
// (SELECT id,mcno as name, max(duration) FROM curstp GROUP BY mnco) as t2
// ON t1.duration=t2.duration and t1.name=t2.name //Subquery 2

//SELECT t1.mcno as id,t1.rtime as current_run_time,(t1.sstime+t1.lstime) as current_stop_time,t2.scode as error_code, t2.duration as stop_time FROM curpord as t1 INNER JOIN curstop as t2 ON t1.mcno = t2.mcno


// 

// id
// SDate
// Enabled
// Picks
// Status