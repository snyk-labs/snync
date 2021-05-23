const fs = require('fs')
const path = require('path')
const { testProject } = require('../src')

const decompress = require('decompress')

const projectFixtures = ['simple-project.zip']

const destinationFixtures = path.resolve(path.join(__dirname, '__fixtures__', 'tmp'))

beforeAll(async () => {
  if (!fs.existsSync(destinationFixtures)) {
    fs.mkdirSync(destinationFixtures)
  }

  for (const fixtureName of projectFixtures) {
    const fixtureProjectPath = path.resolve(path.join(__dirname, '__fixtures__', fixtureName))
    const fixtureDirectoryName = path.basename(fixtureName, '.zip')
    if (fs.existsSync(path.resolve(path.join(destinationFixtures, fixtureDirectoryName)))) {
      continue
    } else {
      await decompress(fixtureProjectPath, destinationFixtures)
    }
  }
})

test('integration test', async () => {
  const projectPath = path.resolve(path.join(destinationFixtures, 'simple-project'))

  let out = ''
  await testProject({ projectPath, log: (...args) => (out += `${args.join(' ')}\n`) })
  expect(out).toMatchSnapshot()
})
