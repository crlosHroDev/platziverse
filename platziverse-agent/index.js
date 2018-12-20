'use strict'

const debug=require('debug')('platziverse:agent')
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
      
        this._timer=setInterval(()=>{
          this.emit('agent/message','this is a message')
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
      this.emit('disconnected')
    }
  }
}
module.exports=PlatziverseAgent
