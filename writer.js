import fsp from 'bare-fs/promises'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import b4a from 'b4a'

export async function writer (corekey) {
  const store = new Corestore(Pear.config.storage)

  const swarm = new Hyperswarm()
  Pear.teardown(() => swarm.destroy())

  swarm.on('connection', conn => store.replicate(conn))

  const core = store.get({ name: corekey })

  const bee = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })

  await core.ready()

  const discovery = swarm.join(core.discoveryKey)

  discovery.flushed().then(() => {
    console.log('bee key:', b4a.toString(core.key, 'hex'))
  })

  if (core.length <= 1) {
    console.log('importing dictionary...')
    const dict = JSON.parse(await fsp.readFile('./dict.json'))
    const batch = bee.batch()
    for (const { key, value } of dict) {
      await batch.put(key, value)
    }
    await batch.flush()
  } else {
    console.log('seeding dictionary...')
  }

  return await b4a.toString(core.key, 'hex')
}
