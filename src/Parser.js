'use strict'

import path from 'path'
import fs from 'fs'
import validatePackageName from 'validate-npm-package-name'

class Parser {
  constructor({ directoryPath, manifestType } = {}) {
    this.directoryPath = directoryPath
    this.manifestType = manifestType
  }

  getEarliestSnapshotPerDependency({ snapshots }) {
    const result = {}

    if (this.manifestType === 'npm') {
      for (const snapshot of snapshots) {
        let manifest

        try {
          manifest = JSON.parse(snapshot.content)
        } catch (_) {
          // Skip broken snapshots
          continue
        }

        const dependencies = this.getDependencies({ manifest })

        for (const dependency of dependencies) {
          if (!result[dependency]) {
            result[dependency] = snapshot
          }
        }
      }
    }

    return result
  }

  getDependenciesFromManifest() {
    let projectManifest

    if (this.manifestType === 'npm') {
      projectManifest = JSON.parse(
        fs.readFileSync(path.resolve(path.join(this.directoryPath, 'package.json')))
      )
    }

    return this.getDependencies({ manifest: projectManifest })
  }

  getDependencies({ manifest }) {
    let allDependencies

    if (this.manifestType === 'npm') {
      // @TODO need to also add here other sources for deps like peerDeps, etc
      const prodDependencies = Object.keys(manifest.dependencies || {})
      const devDependencies = Object.keys(manifest.devDependencies || {})

      allDependencies = [].concat(prodDependencies, devDependencies)
    }

    return allDependencies
  }

  classifyScopedDependencies(dependencies) {
    const scopedDependencies = []
    const nonScopedDependencies = []
    let scopedOrgs = []

    for (const dependency of dependencies) {
      const packageNameStructure = dependency.match(validatePackageName.scopedPackagePattern)
      if (packageNameStructure && packageNameStructure[1]) {
        scopedDependencies.push(dependency)
        scopedOrgs.push(packageNameStructure[1])
      } else {
        nonScopedDependencies.push(dependency)
      }
    }

    scopedOrgs = [...new Set(scopedOrgs)]

    return {
      scopedOrgs,
      scopedDependencies,
      nonScopedDependencies
    }
  }
}

export default Parser
