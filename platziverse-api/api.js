'use strict'

const debug=require('debug')('platziverse:api:router')
const express=require('express')
const asyncify=require('express-asyncify')
const db=require('platziverse-db')
const config=require('./config')

const api=asyncify(express.Router())

let services,Agent,Metric

api.use('*',async (req,res,next)=>{
  if(!services){
    debug('Connecting to database')
    try{
      services=await db(config.db)
    }catch(e){
      return next(e)   
    }
    
    Agent=services.Agent
    Metric=services.Metric
  }
  next()//debemos llamar la funcion de next para que el middleware continue la ejecucion del request
})

api.get('/agents',(req,res)=>{
  debug('A request has come to /agents')
  res.send({})
})


api.get('/agents/:uuid',(req,res,next)=>{ //luego de los dos puntos uuid llegaria al objeto como un parametro
  const {uuid}=req.params
  
  if(uuid!='yyy'){ //manejo del error dentro de la API
    return next(new Error('Agent not found'))
  }
  res.send({uuid})
}) 
api.get('/metrics/:uuid',(req,res)=>{
  const {uuid}=req.params
  res.send({uuid})
})

api.get('/metrics/:uuid/:type',(req,res)=>{
  const {uuid,type}=req.params
  res.send({uuid,type})
})

module.exports=api
