'use strict'

const fp = require('fastify-plugin')
const Dataloader = require('dataloader')

module.exports = fp(async function (app, opts) {
  const loadersConfig = opts || null

  app.log.debug(loadersConfig, 'Init dataloader plugin')

  app.decorateReply('dataloaders', {})

  app.addHook('preHandler', async (req, reply) => {
    reply.dataloader = makeDataloader()
  })

  const loaders = new Map(Object.entries(loadersConfig))
  const dataloaders = new Map()

  app.decorate('dataloader', {
    registerDataloader: (_name, _loader) => {
      dataloaders.set(_name, _loader)
    }
  })

  function makeDataloader () {
    return loaderKey => {
      if (!loaders || !loaders.has(loaderKey)) throw new Error(`Unknown loader ${loaderKey}`)

      if (!dataloaders.has(loaderKey)) {
        const loader = new Dataloader(loaders.get(loaderKey))
        app.log.debug({ loader: loaderKey }, `Initializing dataloader`)
        dataloaders.set(loaderKey, loader)
      }
      return dataloaders.get(loaderKey)
    }
  }
})
