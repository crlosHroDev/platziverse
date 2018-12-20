'use strict'

const setupDatabase=require('./lib/db')
const setupAgentModel=require('./models/agent')
const setupMetricModel=require('./models/metric')
const  setupAgent=require('./lib/agent')
const setupMetric=require('./lib/metric')
const defaults=require('defaults')

module.exports=async function (config){
  config=defaults(config,{//Todo lo del objeto de config lo vamos a obtener y si no estan definidas se toman por defecto:
    dialect:'sqlite',
    pool:{
      max:10,
      min:0,
      idle:10000 //si la conexion no pasa nada en 10 segundos sale de la conexion
    },
    query:{
      raw:true//me entregue objetos de js json sencillos
    }
    
  })  
  const sequelize=setupDatabase(config)//Aqui ya llamo el singleton
  const AgentModel=setupAgentModel(config)
  const MetricModel=setupMetricModel(config)
  
  //Definir las relaciones Sequelize crea automatamente las FK
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)
  
  await sequelize.authenticate() //validar que la BD este bien validada
  
  if (config.setup){
    await sequelize.sync({force:true})//obliga a que se cree la bd desde 0, borrando si ya esta una existente
  }
  
  const Agent=setupAgent(AgentModel)
  const Metric=setupMetric(MetricModel,AgentModel)
  
  return{
    Agent,
    Metric
  }

}
