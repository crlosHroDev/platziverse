'use strict'

const debug=require('debug')('platziverse:mqtt')
const mosca=require('mosca')
const redis=require('redis')
const chalk=require('chalk')
const db=require('platziverse-db')

const {parsePayload}=require('./utils')


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
const clients=new Map()

let Agent,Metric

server.on('clientConnected',client=>{
  debug(`Client Connected: ${client.id}`) //este id es autogenerado por mqtt
  clients.set(client.id,null)
})

server.on('clientDisconnected',async (client)=>{
  debug(`Client Disonnected: ${client.id}`) 
  const agent=clients.get(client.id)
  
  if(agent){
    //Mark agent as disconnected   
    agent.connected=false
    
    try{
      await Agent.createOrUpdate(agent)
    }catch(e){
      return handleError(e)
    }
    
    //Delete Agent from Clients List
    clients.delete(client.id)
    
    server.publish({
      topic:'agent/disconnected',
      payload:JSON.stringify({
        agent:{
          uuid:agent.uuid
        }
      })
    })
    debug(`Client ${client.id} associated to Agent ${agent.uuid} marked as Disconnected`)
  }
})

server.on('published',async (packet,client)=>{
  debug(`Received: ${packet.topic}`)//topic es el tipo de mensaje
  
  switch(packet.topic){
    case 'agent/connected':
    case 'agent/connected':
      debug(`Payload:${packet.payload}`)
      break
    case 'agent/message':
      const payload=parsePayload(packet.payload)
      if(payload){
        payload.agent.connected=true
        
        let agent
        try{
          agent=await Agent.createOrUpdate(payload.agent)
        }catch(e){
          return handleError(e)
        }
        debug(`Agent ${agent.uuid} saved`)
        
        //Notify Agent is Connected
        
        if(!clients.get(client.id)){
          clients.set(client.id,agent)
          server.publish({
            topic:'agent/connected',
            payload:JSON.stringify({
              agent:{
                uuid:agent.uuid,
                name:agent.name,
                hostname:agent.hostname,
                pid:agent.pid,
                connected:agent.connected
              }
            })
          })
        }
        
        //Store metrics
        
        for(let metric of payload.metrics){ //permite iterar por los objetos de cada arreglo y usamos este porque haremos operaciones async await para sacar las metricas
          let m
          
          try{
            m= await Metric.create(agent.uuid,metric)
          }catch(e){
            return handleError(e)
          }
          
          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
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

function handleError(err){
   console.error(`${chalk.red('fatal error')} ${err.message}`)
   console.error(err.stack)
}

process.on('uncaughtException',handleFatalError)
process.on('unhandleRejection',handleFatalError)
