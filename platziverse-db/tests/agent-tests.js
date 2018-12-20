'use strict'

const test=require('ava')
const sinon=require('sinon')
const proxyquire=require('proxyquire')

const agentFixtures=require('./fixtures/agent')

let config={
  logging:function(){}
}

let MetricStub={ 
  belongsTo:sinon.spy()//spy es una funcion especifica que me va a permitir hacerle preguntas
}

let Single=Object.assign({},agentFixtures.single)//Cuando estemos probando los stubs podamos probar con una instancia por aparte
let connectedArgs={
  where:{connected:true}
}
let usernameArgs={
  where:{username:'platzi',connected:true}
} 
let uuidArgs={
  where:{uuid}
}

let newAgent={
  uuid:'123-123-123',
  name:'test',
  username:'test',
  hostname:'test',
  pid:0,
  connected:false
}
let id=1
let uuid='yyy-yyy-yyy'
let AgentStub=null
let db=null
let sandbox=null//sanbox cuando se vuelva a llamar el test se reinician los valores para reiniciar uno diferente

let uuidArgs={
  where:{
    uuid
  }
}

test.beforeEach(async()=>{
  sandbox=sinon.sandbox.create()
  AgentStub={
    hasMany:sandbox.spy()
  }
  //Model create Stub
  AgentStub.create=sandbox.stub()
   Agent.create.withArgs(newAgent).returns(Promise.resolve({
   toJSON(){return newAgent}}))
  
  
  //Model findOne Stub
  Agent.findOne=sandbox.stub()
  Agent.findOne.withArgs(uuidArgs).returns(Promise.resolve(agent.Fixtures.byUuid(uuid)))
  
  
  //Model findById Stub
  AgentStub.findbyId=sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))
  
  //Model update Stub
  AgentStub.update=sandbox.stub()
  AgentStub.update.withArgs(single,uuidArgs).returns(Promise.resolve(single))
  
  //Model findAll Stub
  AgentStub.findAll=sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))
  
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

test.serial('Agent#findById',async t =>{
  let agent=await db.Agent.findById(id)
  t.true(AgentStub.findById.called,'findById should be called on model')
  t.true(AgentStub.findById.calledOnce,'findById should be called once')
  t.true(AgentStub.findById.calledWith(id),'findById should be called with specified id')
  
  t.deepEqual(agent,agentFixtures.byId(id),'should be the same')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without args')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('Agent#createorUpdate - exists',async t =>{
  let agent=await db.Agent.createOrUpdate(single)
  
  t.true(AgentStub.findOne.called,'findOne should be calle on model')
  t.true(AgentStub.findById.calledTwice,'findById should be called twice')
  t.true(AgentStub.update.calledOnce,'update should be called once')
  
  t.deepEqual(agent,single,'agent should be the same')
})

test.serial('Agent#createOrUpdate - new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'findOne should be called with uuid args')
  t.true(AgentStub.create.called, 'create should be called on model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args')

  t.deepEqual(agent, newAgent, 'agent should be the same')
})
