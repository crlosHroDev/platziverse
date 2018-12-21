'use strict'

const debug=require('debug')('platziverse:api')
const http=require('http')
const chalk=require('chalk')
const express=require('express')//Se va a encargar de crear una request handler que se ejecutará cada vez que llega una peticion a nuestro servidor

const api=require('./api')

const port=process.env.PORT|| 3000
const app=express()
const server=http.createServer(app)

api.use('/api',api)//Funcion para montar middlewares en express. Montar en la ruta /api que sera /api/agent

//Express error handler
app.use((err,req,res,next)=>{//el objeto de next siempre lo va a tener el middleware
  debug(`Error:${err.message}`)
  
  if(err.message).match(/not found/){
    return res.status(404).send({error:err.message})
  }
  
  function handleFatalError(err){
    console.error(`${chalk.red('[fatal error]')} ${err.message}`)
    console.error(err.stack)
    process.exit(1)
  }
  if(!module.parent){ //sino lo estoy requiriendo el modulo el entraria este if, esto se hace con el fin de poder usarlo en las pruebas
     process.on('uncaughtException',handleFatalError)
     process.on('unhandledRejection',handleFatalError)
  
    res.status(500).send({error:err.message})

    server.listen(port,()=>{
        console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
    }) 
  }

module.exports=server
