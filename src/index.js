'use strict'

const RepoManager = require('../src/RepoManager')
const Parser = require('../src/Parser')
const RegistryClient = require('../src/RegistryClient')

async function testProject({ projectPath, log, debugMode }) {
  const registryClient = new RegistryClient()
  const repoManager = new RepoManager({ directoryPath: projectPath })

  const parser = new Parser({
    directoryPath: projectPath,
    manifestType: 'npm'
  })

  const allDependencies = parser.getDependenciesFromManifest()
  const { nonScopedDependencies } = parser.classifyScopedDependencies(allDependencies)
  // @TODO warn the user about `scopedDeps` and `scopedDependencies` to make sure they own it

  log()
  log('Reviewing your dependencies...')
  log()

  const snapshots = repoManager.getFileSnapshots({ filepath: 'package.json' })
  const earliestSnapshotPerDependency = parser.getEarliestSnapshotPerDependency({ snapshots })

  // Make all requests in parallel and await later when it needed
  const packagesMetadataRequests = nonScopedDependencies.reduce((acc, dependency) => {
    acc[dependency] = registryClient.getPackageMetadataFromRegistry({
      packageName: dependency
    })
    return acc
  }, {})

  for (const dependency of nonScopedDependencies) {
    log(`Checking dependency: ${dependency}`)

    const packageMetadataFromRegistry = await packagesMetadataRequests[dependency]
    const timestampOfPackageInSource = earliestSnapshotPerDependency[dependency]
      ? earliestSnapshotPerDependency[dependency].ts
      : Date.now() // If a dependency is not in the git history (just added in the working copy)

    let timestampOfPackageInRegistry
    if (packageMetadataFromRegistry && packageMetadataFromRegistry.error === 'Not found') {
      timestampOfPackageInRegistry = null
    } else {
      // npmjs keeps time.created always in UTC, it's a ISO 8601 time format string
      timestampOfPackageInRegistry = new Date(packageMetadataFromRegistry.time.created).getTime()
    }

    // @TODO add debug for:
    // console.log('package in source UTC:   ', timestampInSource)
    // console.log('package in registry:     ', timestampOfPackageInRegistry)

    const status = resolveDependencyConfusionStatus({
      timestampOfPackageInSource,
      timestampOfPackageInRegistry
    })

    if (status) {
      log('  -> ', status)
    }

    if (debugMode && earliestSnapshotPerDependency[dependency]) {
      log('  -> introduced via commit sha: ', earliestSnapshotPerDependency[dependency].hash)
    }
  }
}

function resolveDependencyConfusionStatus({
  timestampOfPackageInSource,
  timestampOfPackageInRegistry
}) {
  let status = null

  // if timestampOfPackageInRegistry exists and has
  // numeric values then the package exists in the registry
  if (timestampOfPackageInRegistry > 0) {
    const timeDiff = timestampOfPackageInSource - timestampOfPackageInRegistry
    if (timeDiff < 0) {
      // this means that the package was first introduced to source code
      // and now there's also a package of this name in a public registry
      status = '❌ suspicious'
    }
  } else {
    status = '⚠️ vulnerable'
  }

  return status
}

module.exports = { testProject }
