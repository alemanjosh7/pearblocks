// #!/usr/bin env bare
import fsp from 'bare-fs/promises'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import b4a from 'b4a'
import process from 'bare-process'
if (process.argv.includes('--h') || process.argv.includes('--help')) {
  console.log(process.argv)
  process.exit(-1)
}
async function ask(corekey, word) {
  const store = new Corestore(Pear.config.storage)
  console.log(`Your core key is: ${corekey}`)
  console.log(`The Pear Block you want to know about is: ${word}`)
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
    console.log('You can connect from another command like using this Hyperbee key:', b4a.toString(core.key, 'hex'))
  })

  const key = b4a.toString(core.key, 'hex')
  if (core.length <= 1) {
    console.log('Importing dictionary...')
    const dict = JSON.parse(await fsp.readFile('./dict.json'))
    const batch = bee.batch()
    for (const { key, value } of dict) {
      await batch.put(key, value)
    }
    await batch.flush()
  } else {
    console.log('Seeding dictionary...')
  }

  if (!key) throw new Error('provide a key')

  swarm.join(core.discoveryKey)

  if (!word.length) return
  let response = ''

  await bee.get(word).then(node => {
    if (!node || !node.value) {
      response = `No dictionary entry for ${word}`
      return
    }
    response = `Holepunch's Block ${word} is: ${node.value}`
  })

  return await response
}


if (process.argv[2] == '--ask') {
  const text = [process.argv[3].substring(2, process.argv[3].length), process.argv[4].substring(2, process.argv[4].length)]
  const response = await ask(text[0], text[1])
  console.log(response)
  process.kill()
}
