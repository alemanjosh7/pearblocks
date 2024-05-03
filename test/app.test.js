import test from 'brittle'
import { beekey, notFound, init, cmd, help } from '../pearblock.js'
import process from 'bare-process'

test('beekey', async function (t) {
  t.is(typeof (process.argv[2]), 'string')
  setTimeout(() => {
    beekey(process.argv[2])
    process.exit()
  }, 1000)
})

test('init', async function (t) {
  t.ok(process.argv.length > 2)
  t.is(typeof (process.argv[2]), 'string')
  setTimeout(() => {
    t.is(typeof (init(process.argv[2]), 'string'))
    process.exit()
  }, 1000)
  t.pass('import initialized correctly')
})

test('commandNotFound', async function (t) {
  t.is(typeof (notFound('test')), 'string')
  t.pass()
})

test('ask', async function (t) {
  t.ok(process.argv.length > 3)
  t.is(typeof (process.argv[2]), 'string')
  t.is(typeof (process.argv[3]), 'string')
  setTimeout(() => {
    t.is(typeof (ask(process.argv[2], process.argv[3]), 'string'))
    process.exit()
  }, 1000)
  t.pass('question answered correctly')
})

test('cmdStdout', async function (t) {
  t.plan(1)
  cmd.output.on('close', () => t.pass('closed')).end('succesful')
})

test('cmdHelp', async function (t) {
  setTimeout(() => {
    help()
    process.exit()
  }, 1000)
})
