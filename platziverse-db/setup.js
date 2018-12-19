'use strict'

const debug=require('debug')('platziverse:db:setup')

const db=require('./')

async function setup(){
  
  const config={
    database:process.env.DB_NAME||'platziverse', //valores como variables de entorno o por defecto para desarrollo platziverse
    username:process.env.DB_USER ||'platzi',
    password:process.env.DB_PASS ||'platzi',
    host:process.env.DB_HOST || 'localhost',
    dialect:'postgres',//sequelize puede conectar a diferentes bases de datos.
    logging:s=>debug(s),//sirve para realizar debug
    setup:true // esta props se usará para que en el archivo index.js se force a que se borre la bd que esta en postgres y se cree una nueva
  }
  await db(config).catch(handleFatalError)
  
  console.log('Success!')
  process.exit(0)//en el caso que no suceda el error
}

function handleFatalError(err){
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)//proceso de error 1 para finalizar
}

setup()
