'use strict'

const debug=require('debug')('platziverse:agent')
const os=require('os')
const util=require('util')//transformar una funcion callback parent normal de node a una promesa
const mqtt=require('mqtt')
const defaults=require('defaults')
const EventEmitter=require('events')
const {parsePayload}=require('../platziverse-mqtt/utils')
const uuid=require('uuid')

const options={
  name:'untitled',
  username:'platzi',
  interval:5000,
  mqtt:{
    host:'mqtt://localhost'
  }
}

class PlatziverseAgent extends EventEmitter{
  constructor(opts){
    super()
    
    this._options=defaults(opts,options)
    this._started=false
    this._timer=null
    this._cliente=null
    this._agentId=null
    this._metrics=new Map()
  }
  
  addMetric(type,fn){
    this._metrics.set(type,fn)
  }
  
  removeMetric(type){
    this._metrics.delete(type)
  }
  
  connect(){
    if(!this._started){
      const opts=this._options
      this._client=mqtt.connect(opts.mqtt.host)
      this._started=true
      this._client.suscribe('agent/message')//nos va decir cuando recibamos mensajes del servidor mqtt
      this._client.suscribe('agent/connected')
      this._client.suscribe('agent/disconnected')
      
      this._client.on('connect',()=>{
        this._agentId=uuid.v4()
        this.emit('connected',this._agentId)
      
        this._timer=setInterval(async ()=>{
          if(this._metrics.size>0){
            let message={
              agent:{
                uuid:this._agentId,
                username:opts.username,
                name:opts.name,
                hostname:os.hostname()||'localhost',
                pid:process.pid
              },
              metrics:[],
              timestamp:new Date().getTime()
            }
          }
          
          for (let [metric,fn] of this._metrics){//iterar todas las funciones y metricas del mapa
            if(fn.lenght==1){ // si es igual 1 es porque tiene argumento y es un callback
              fn=util.promisify(fn)//transformar esa funcion de callback a promesa
            }
            
            message.metrics.push({
              type:metric,
              value:await Promise.resolve(fn())
            })
          }
          
          debug('Sending',message)
          
          this._client.publish('agent/message',JSON.stringify(message))
          this.emit('message',message)
          
        },opts.interval)
        })
      
      this._client.on('message',(topic,payload)=>{
        payload=parsePayload(payload)
        
        let broadcast=false
        switch(topic){
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
             broadcast=payload && payload.agent && payload.agent.uuid!!this._agentId //Si y solo si el mensaje es diferente a un mensaje que yo enviaria para no estar retransmitiendo mis mensajes o hacer broadcast de mis mensajes
             break
        }
        
        if(broadcast){ //retransmision mensajes
          this.emit(topic,payload)
        }
      })
      
      this._client.on('error'()=>this.disconnect())
      

    }
  }
  disconnect(){
    if(this._started){
      clearInterval(this._timer)
      this._started=false
      this.emit('disconnected',this._agentId)
      this._client.end()
    }
  }
}
module.exports=PlatziverseAgent
