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
    return new Promise(resolve => resolve(keys.map(key => {
      return { id: key, hello: 'world' }
    })))
  }
})

app.get('/', async (_, reply) => {
  const user1 = await reply.dataloader('user').load(1)
  const user2 = await reply.dataloader('user').load(2)
  const user12 = await reply.dataloader('user').load(1)

  reply.send({ user1, user2, user12 })
})

app.listen(3000)
