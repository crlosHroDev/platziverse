'use strict'

const http=require('http')
const chalk=require('chalk')
const express=require('express')//Se va a encargar de crear una request handler que se ejecutará cada vez que llega una peticion a nuestro servidor

const port=process.env.PORT|| 3000
const app=express()
const server=http.createServer(app)

server.listen(port,()=>{
  console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
})

