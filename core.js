import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import b4a from 'b4a'
import process from 'bare-process'
import { Node } from 'hyperbee/lib/messages.js'

export async function core () {
  console.log(process.argv[2].substring(2, process.argv[2].length))
  const store = new Corestore('./reader-storage')

  const swarm = new Hyperswarm()
  Pear.teardown(() => swarm.destroy())

  swarm.on('connection', conn => store.replicate(conn))

  const core = store.get({ key: b4a.from(process.argv[2].substring(2, process.argv[2].length), 'hex') })
  await core.ready()

  const foundPeers = store.findingPeers()
  swarm.join(core.discoveryKey)
  swarm.flush().then(() => foundPeers())

  await core.update()

  const seq = core.length - 1
  const lastBlock = await core.get(core.length - 1)

  console.log(`Raw Block ${seq}:`, lastBlock)
  console.log(`Decoded Block ${seq}`, Node.decode(lastBlock))
}
