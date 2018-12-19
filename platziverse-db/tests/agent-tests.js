'use strict'

const test=require('ava')
const sinon=require('sinon')
const proxyquire=require('proxyquire')

let config={
  logging:function(){}
}

let MetricStub={ 
  belongsTo:sinon.spy()//spy es una funcion especifica que me va a permitir hacerle preguntas
}

let AgentStub=null
let db=null
let sandbox=null//sanbox cuando se vuelva a llamar el test se reinician los valores para reiniciar uno diferente

test.beforeEach(async()=>{
  sandbox=sinon.sandbox.create()
  AgentStub={
    hasMany:sandbox.spy()
  }
  const setupDatabase=proxyquire('../',{
    './models/agent':()=>AgentStub,
    './models/metric':()=>MetricStub
  })
  db=await setupDatabase(config)
})

test.afterEach(()=>{
  sandbox && sinon.sandbox.restore()//Aqui se reinicia el sandbox
})

test('Agent',t=>{
  t.truthy(db.Agent,'Agent service should exist')//Que ese valor resuelva verdadero, es decir que no sea vacio
})

test.serial('Setup',t=>{//Garantizar que las funciones fueron llamadas por Sinon
  t.true(AgentStub.hasMany.called,'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub),'Argument should be the Model')//calledWith es para decir que fue llamada especificamente con un argumento 
  t.true(MetricStub.belongsTo.called,'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub),'Argument should be the Model')
})
