'use strict'

const test=require('ava')

let config={
  logging:function(){}
}
let db=null

test.before(async()=>{
  const setupDatabase=require('../')
  db=await setupDatabase(config)
})

test('Agent',t=>{
  t.truthy(db.Agent,'Agent service should exist')//Que ese valor resuelva verdadero, es decir que no sea vacio
})
