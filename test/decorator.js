'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const dataloader = require('..')

test('basic dataloader instance', async (t) => {
  const app = Fastify()

  app.register(dataloader, {
    user: keys => {
      app.log.debug({ keys }, 'fetching user')
      return new Promise(resolve => keys.map(key => {
        return { id: key, test: 'hello' }
      }))
    }
  })

  app.get('/', (request, reply) => {
    return reply.dataloader('user').load(1)
  })

  await app.inject({
    method: 'GET',
    url: '/?id=1'
  }, (err, response) => {
    t.error(err)
    t.strictEqual(response.statusCode, 200)
    t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
    t.deepEqual(JSON.parse(response.payload), { id: 1, hello: 'world' })
  })
})
