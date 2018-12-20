'use strict'

const debud=require('debug')('platziverse:mqtt')
const mosca=require('mosca')
const redis=require('redis')
const chalk=require('chalk')

const backend={
  type:'redis',
  redis,
  return_buffers:true //viene binaria y es mas facil para redis
}

const settings={
  port:1883,//puerto por default
  backend
}

//instanciar el servidor
const server=new mosca.Server(settings)

server.on('ready',()=>{
  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})
