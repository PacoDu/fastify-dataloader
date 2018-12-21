# fastify-dataloader
fastify-dataloader implement [dataloader](https://github.com/facebook/dataloader) for Fastify. 
This plugin handles dynamic creation of dataloader instances for each request, this comply with the caching per-request recommendation of dataloader.

## Register 

To register fastify-dataloader you have to specify your batchLoading functions in opts:
```javascript
function userBatchLoader(keys) {
  // fetch keys from backend
}

app.register(require('fastify-dataloader'), {
  user: userBatchLoader
})
```

## Usage

Once registered you can access your dataloader instances with `reply`:
```javascript
app.get('/user/:id', async (request, reply) => {
  return reply.dataloader('user').load(request.params.id)
})
```

## Example

```javascript
'use strict'
const Fastify = require('fastify')

const app = Fastify({
  logger: {
    level: 'debug'
  }
})

// A dummy ORM example
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

// Register fastify-dataloader
app.register(require('fastify-dataloader'), {
  user: ORM.user.batchLoader
})

app.get('/', async (_, reply) => {
  // ORM will be called only once to fetch [1, 2]
  const user1 = await reply.dataloader('user').load(1)
  const user2 = await reply.dataloader('user').load(2)
  const user1duplicate = await reply.dataloader('user').load(1)

  reply.send({ user1, user2, user1duplicate })
})

app.listen(3000)
```