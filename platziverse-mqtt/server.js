'use strict'

const debug=require('debug')('platziverse:mqtt')
const mosca=require('mosca')
const redis=require('redis')
const chalk=require('chalk')
const db=require('platziverse-db')

const backend={
  type:'redis',
  redis,
  return_buffers:true //viene binaria y es mas facil para redis
}

const settings={
  port:1883,//puerto por default
  backend
}

 const config={
    database:process.env.DB_NAME||'platziverse',
    username:process.env.DB_USER||'platzi',
    password:process.env.DB_PASS||'platzi',
    host:process.env.DB_HOST||'localhost',
    dialect:'postgres',
    logging:s=>debug(s)
  }

//instanciar el servidor
const server=new mosca.Server(settings)

let Agent,Metric

server.on('clientConnected',client=>{
  debug(`Client Connected: ${client.id}`) //este id es autogenerado por mqtt
})

server.on('clientDisconnected',client=>{
  debug(`Client Disonnected: ${client.id}`) 
})

server.on('published',(packet,client)=>{
  debug(`Received: ${packet.topic}`)//topic es el tipo de mensaje
  debug(`Payload: ${packet.payload}`) //payload es el objeto, la info enviada
})

server.on('ready',async ()=>{
  const services=await db(config).catch(handleFatalError)//se instancia la bd aqui porque en esta parte se inicia el server
  
  Agent=services.Agent
  Metric=services.Metric
  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

server.on('error',handleFatalError)

function handleFatalError(err){
  console.error(`${chalk.red('fatal error')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException',handleFatalError)
process.on('unhandleRejection',handleFatalError)
