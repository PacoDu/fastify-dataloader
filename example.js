'use strict'
const Fastify = require('fastify')
const dataloader = require('.')

const app = Fastify({
  logger: {
    level: 'debug'
  }
})

app.register(dataloader, {
  user: keys => {
    app.log.debug({ keys }, 'fetching user')
    return new Promise(resolve => keys.map(key => {
      return { id: key, test: 'hello' }
    }))
  }
})

app.get('/', (request, reply) => {
  const user1 = reply.dataloader('user').load(1)
  const user2 = reply.dataloader('user').load(2)
  const user12 = reply.dataloader('user').load(1)

  reply.send({ user1, user2, user12 })
})

app.listen(3000)
