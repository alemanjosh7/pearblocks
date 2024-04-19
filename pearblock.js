import fsp from 'bare-fs/promises'
import Hyperswarm from 'hyperswarm'
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'
import b4a from 'b4a'
import readline from 'bare-readline'
import tty from 'bare-tty'

const cmd = readline.createInterface({
  input: new tty.ReadStream(0),
  output: new tty.WriteStream(1)
})

cmd.input.setMode(tty.constants.MODE_RAW)

const notFound = (command) => {
  console.log(`\nerror: unknown command '${command}'`)
}

const missingArgument = (...args) => {
  console.log(`\nerror: missing argument '${args}'`)
}

const cmdOpt = (line) => {
  const k = (line.length < 3 || line[2] == '')
  const w = (line.length < 4 || line[3] == '')
  const err = []
  if (k) err.push('key')
  switch (line[1]) {
    case 'init':
      if (k) {
        missingArgument(err)
      }
      else {
        init(line[2])
      }
      break
    case 'ask':
      if (w) err.push('word')
      if (w || k) missingArgument(err)
      else ask(line[2], line[3])
      break
    case 'beekey':
      if (k) missingArgument(err)
      else beekey(line[2])
      break
    default:
      notFound()
  }

};

cmd.on('data', lines => {
  if (lines.length < 10 || lines.substring(0, 10) !== 'pearblocks') {
    notFound()
  }
  else {
    const line = lines.split(" ")
    console.log(line)
    if (line.length > 1) {
      if (line[1].substring(0, 2) == '--') {
        if (line[1].includes('help')) {
          console.log(`
Usage: pearblocks [command] [options]\n
This app is a CLI dictionary that works as serverless application using hyperswarm, corestore, hyperbee, b4a, bare-readline and bare-tty, and where you can look for specific information about a Holepunch's blocks or terminology such as Hyperbee, Hyperswarm, etc\n
Commands:\n
  init <key>               Starts importing or seeding Pearblocks Dictionary with a specific Hypercore Key\n
  beekey <key>             With a Hypercore key you can ask what is your Hyperbee Key\n
  ask <word> <key>         Ask about a specific word in the dictionary with a specific Hypercore key\n`)
        }
        else {
          notFound()
        }
      }
      else {
        cmdOpt(line)
      }
    }
    else notFound()
  }
  cmd.prompt()

})
cmd.prompt()
const beekey = async (corekey) => {
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
    console.log('You can connect from another command like using this Hyperbee key:', b4a.toString(core.key, 'hex'), '\n')
  })

  await core.close()
  await store.close()

}

const init = async (corekey) => {
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

  const key = b4a.toString(core.key, 'hex')
  if (core.length <= 1) {
    console.log('Importing dictionary...\n')
    const dict = JSON.parse(await fsp.readFile('./dict.json'))
    const batch = bee.batch()
    for (const { key, value } of dict) {
      await batch.put(key, value)
    }
    console.log('Dictionary imported!\n')
    await batch.flush()
  } else {
    console.log('Seeding dictionary...\n')
    console.log('Dictionary seeded!\n')
  }
  await core.close()
  await store.close()
}

const ask = async (word, corekey) => {
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

  const key = b4a.toString(core.key, 'hex')

  swarm.join(core.discoveryKey)

  if (!word.length) return
  let response = ''

  await bee.get(word).then(node => {
    if (!node || !node.value) {
      response = `No dictionary entry for ${word}\n`
      return
    }
    response = `Holepunch's Block ${word} is: ${node.value}\n`
  })
  console.log(response)
  await core.close()
  await store.close()

}

