'use strict'

module.exports= function setupAgent(AgentModel){
  async function createOrUpdate(agent){
    const cond={
      where:{
        uuid:agent.uuid 
      }
    }
    const existingAgent=await AgentModel.findOne(cond) //Nos va a retornar la primera ocurrencia que cumpla con la condicion que acaba de pasar
    if(existingAgent){
      const updated=await AgentModel.update(agent,cond)
      return updated ? AgentModel.findOne(cond) : existingAgent
    }
    
    const result=await AgentModel.create(agent) //En el caso que no exista lo creo y convierto en un objeto JSON
    return result.toJSON()
  }
  function findById(id){
    return AgentModel.findById(id)
  }
  
  return{
    createOrUpdate,
    findById
  }

}
