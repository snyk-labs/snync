#!/usr/bin/env node
'use strict'

const path = require('path')
const { argv } = require('process')

const RepoManager = require('../src/RepoManager')
const Parser = require('../src/Parser')
const RegistryClient = require('../src/RegistryClient')

main()

async function main() {
  const cmdArguments = argv
  let projectPath

  if (cmdArguments[2]) {
    projectPath = path.resolve(cmdArguments[2])
    console.log(`Testing project at: ${projectPath}`)
  } else {
    console.error(`Please provide a directory path to the git project to test.`)
    console.error(`  e.g: /home/user/my-app`)
    process.exit(-1)
  }

  const registryClient = new RegistryClient()

  const parser = new Parser({
    directoryPath: projectPath,
    manifestType: 'npm'
  })

  const allDependencies = parser.getDependencies()

  const repoManager = new RepoManager({
    directoryPath: projectPath
  })
  const commitsList = repoManager.getCommitsForFilepath({
    filepath: 'package.json'
  })

  const { nonScopedDependencies } = parser.classifyScopedDependencies(allDependencies)
  // @TODO warn the user about `scopedDeps` and `scopedDependencies` to make sure they own it

  console.log()
  console.log('Reviewing your dependencies...')
  console.log()

  for (const dependency of nonScopedDependencies) {
    console.log(`Checking dependency: ${dependency}`)

    const commitObject = await repoManager.findFirstCommitIntroducingPackage(
      commitsList,
      dependency
    )
    const timestampInSource = repoManager.getTimestampFromCommit({ commitObject })

    const packageMetadataFromRegistry = await registryClient.getPackageMetadataFromRegistry({
      packageName: dependency
    })

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
      timestampInSource,
      timestampOfPackageInRegistry
    })
    if (status) {
      console.log('  -> ', status)
    }
  }
}

function resolveDependencyConfusionStatus({ timestampInSource, timestampOfPackageInRegistry }) {
  let status = null

  // if timestampOfPackageInRegistry exists and has
  // numeric values then the package exists in the registry
  if (timestampOfPackageInRegistry > 0) {
    const timeDiff = timestampInSource - timestampOfPackageInRegistry
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
