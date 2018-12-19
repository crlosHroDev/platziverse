'use strict'

const Sequelize =require('sequelize')
let sequelize=null

module.exports=function setupDatabase(config){
  if(!sequilize){
    sequelize=new Sequelize(config)
  }
  return sequelize
}

