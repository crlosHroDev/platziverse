'use strict'

const setupDatabase=require('./lib/db')
const setupAgentModel=require('./models/agent')
const setupMetricModel=require('./models/metric')


module.exports=async function (config){
  
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
  
  const Agent={}
  const Metric={}
  
  return{
    Agent,
    Metric
  }

}
