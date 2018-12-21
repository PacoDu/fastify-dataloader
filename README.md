# fastify-dataloader
Fastify plugin for [dataloader](https://github.com/facebook/dataloader)

fastify-dataloader also handles dynamic creation of dataloader instances for each request based on your predefined batch loading functions. This comply with the caching per-request recommendation of dataloader.

## Example

```javascript
'use strict'
const Fastify = require('fastify')
const dataloader = require('.')

const app = Fastify({
  logger: {
    level: 'debug'
  }
})

const ORM = {
  user: {
    batchLoader: keys => {
      app.log.debug({ keys }, 'fetching user')

      return new Promise(resolve => {
        const users = keys.map(key => {
          return { id: key, hello: 'world' }
        })
        resolve(users)
      })
    }
  }
}

app.register(dataloader, {
  user: keys => ORM.user.batchLoader(keys)
})

app.get('/', async (_, reply) => {
  const user1 = await reply.dataloader('user').load(1)
  const user2 = await reply.dataloader('user').load(2)
  const user1duplicate = await reply.dataloader('user').load(1)

  reply.send({ user1, user2, user1duplicate })
})

app.listen(3000)
```