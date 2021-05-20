const fs = require('fs')
const path = require('path')
const os = require('os')
const childProcess = require('child_process')
const rimraf = require('rimraf')
const { testProject } = require('../src')

let tmpDir

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snync-'))
  childProcess.spawnSync('git', ['clone', 'git@github.com:snyk-labs/snync-fixtures.git'], {
    cwd: tmpDir
  })
})

afterAll(() => {
  rimraf.sync(tmpDir)
})

test('integration test', async () => {
  let out = ''
  await testProject(`${tmpDir}/snync-fixtures`, (...args) => (out += `${args.join(' ')}\n`))
  expect(out).toMatchSnapshot()
})
