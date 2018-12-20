#platziverse-agent

##usage

```js
const PlatziverseAgent=require('platziverse-agent')

const agent=new PlatziverseAgent({
  interval:2000
})

agent.on('agent/message',payload=>{
  console.log(payload)
})

setTimeout(()=>agent.disconnected,20000)

```
