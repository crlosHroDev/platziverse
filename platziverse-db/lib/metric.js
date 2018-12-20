'use strict'

module.exports=function setupMetric(MetricModel,AgentModel){
  
  async function findByAgentUuid(uuid){
    return MetricModel.findAll({
    attributes:['type'],//esto es para hacer un select trype from metrics
    group:['type'],
    include:[{ //aqui se haria el join donde se haria por AgentModel y que este no incluya ningun atributo y que sean uuid iguales
      attributes:[],
      model:AgentModel,
      where:{
        uuid
      }
    }],
    raw:true  
  })
  }
  
  //buscar por tipo de metrica y por tipo de agente
  
  async function findByTypeAgentUuid(type,uuid){
    return MetricModel.findAll({
        attributes:['id','type','value','createdAt'],
        where:{
          type
        },
        limit:20,
        order:[['createdAt','DESC']],
        include:[{
          attributes:[],
          model:AgentModel,
          where:{
            uuid
          }
        }],
          raw:true
    })
  } 
  
  
  async function create (uuid,metric){
    const agent = await AgentModel.findOne({//aqui se busca si esta el agente o no
      where:{uuid}
    })
    
    if (agent){
      Object.assign(metric,{agenthttps://platzi.com/clases/1151-nodejs/8339-implementacion-del-servicio-metric/Id:agent.id})//se le asigna a nuestro objeto de metricas el id de agente
      const result=await MetricModel.create(metric) //Almacenar la metrica en la base de datos
      return result.toJSON() //en la logica de la app siempre creare una metrica nueva, no sera actualizada
    }
  }
  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
