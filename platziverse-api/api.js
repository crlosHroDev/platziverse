'use strict'

const debug=require('debug')('platziverse:api:router')
const express=require('express')

const api=express.Router()

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
