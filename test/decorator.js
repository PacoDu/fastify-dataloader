'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const fDataloader = require('..')
const Dataloader = require('dataloader')

test('dataloader is instance of Dataloader', async (t) => {
  const app = Fastify()

  app.register(fDataloader, {
    user: _ => {}
  })

  app.get('/', async (_, reply) => {
    const loader = await reply.dataloader('user')
    t.strictEqual(loader instanceof Dataloader, true)
    return {}
  })

  try {
    await app.inject({
      method: 'GET',
      url: '/'
    })
  } catch (err) {
    t.error(err)
  }
})

test('load calls related loader', async (t) => {
  const app = Fastify()

  app.register(fDataloader, {
    user: keys => {
      app.log.debug({ keys }, 'fetching user')
      return new Promise(resolve => resolve(keys.map(key => {
        return { id: key, type: 'user' }
      })))
    },
    author: keys => {
      app.log.debug({ keys }, 'fetching user')
      return new Promise(resolve => resolve(keys.map(key => {
        return { id: key, type: 'author' }
      })))
    }
  })

  app.get('/:id', async (req, reply) => {
    const loader = reply.dataloader('user')
    return loader.load(req.params.id)
  })

  try {
    const res = await app.inject({
      method: 'GET',
      url: '/1'
    })

    t.strictEqual(res.statusCode, 200)
    t.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    t.deepEqual(JSON.parse(res.payload), { id: 1, type: 'user' })
  } catch (err) {
    t.error(err)
  }
})
