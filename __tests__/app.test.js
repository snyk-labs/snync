const fs = require('fs')
const path = require('path')
const { testProject } = require('../src')

const decompress = require('decompress')

jest.setTimeout(30000)

const projectFixtures = [
  'simple-project.zip',
  'small-project.zip',
  'commit-with-broken-package-json.zip'
]

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

test('Sanity test - simple project', async () => {
  const projectPath = path.resolve(path.join(destinationFixtures, 'simple-project'))

  let out = ''
  await testProject({ projectPath, log: (...args) => (out += `${args.join(' ')}\n`) })
  expect(out).toMatchSnapshot()
})

test('Sanity test - small project', async () => {
  const projectPath = path.resolve(path.join(destinationFixtures, 'small-project'))

  let out = ''
  await testProject({
    projectPath,
    log: (...args) => (out += `${args.join(' ')}\n`),
    debugMode: true
  })
  expect(out).toMatchSnapshot()
})

test('Debug information prints commit SHA', async () => {
  const projectPath = path.resolve(path.join(destinationFixtures, 'simple-project'))

  let out = ''
  await testProject({
    projectPath,
    log: (...args) => (out += `${args.join(' ')}\n`),
    debugMode: true
  })
  expect(out).toMatchSnapshot()
})

// Check the case when commit contains invalid package.json file,
// for example with extra comma.
// commit 456e6f36b5494ff6c2437347ac3ec220248e09c8 fix previous commit
// commit 6b2a52e3177c8b1fad572b10d3090d1e9822945f add async
//     --> This commit introduces extra comma after the last dependency
// commit cba680064122389350203e90b2cbc8705de23b63 add lodash
test('Commit with broken manifest should be ignored', async () => {
  const projectPath = path.resolve(
    path.join(destinationFixtures, 'commit-with-broken-package-json')
  )

  let out = ''
  await testProject({
    projectPath,
    log: (...args) => (out += `${args.join(' ')}\n`),
    debugMode: true
  })
  expect(out).toMatchSnapshot()
})

test('Test case of private package that exists already on npm', async () => {
  const projectPath = path.resolve(
    path.join(destinationFixtures, 'simple-project-existing-package-name')
  )

  let out = ''
  await testProject({
    projectPath,
    log: (...args) => (out += `${args.join(' ')}\n`),
    debugMode: true,
    privatePackagesList: ['eslint-plugin-vue']
  })
  expect(out).toMatchSnapshot()
})
