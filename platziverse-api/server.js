'use strict'

const http=require('http')
const chalk=require('chalk')
const express=require('express')//Se va a encargar de crear una request handler que se ejecutará cada vez que llega una peticion a nuestro servidor

const api=require('./api')

const port=process.env.PORT|| 3000
const app=express()
const server=http.createServer(app)

api.use('/api',api)//Funcion para montar middlewares en express. Montar en la ruta /api que sera /api/agent
server.listen(port,()=>{
  console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
})

