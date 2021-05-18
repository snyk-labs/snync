'use strict'

const path = require('path')
const validatePackageName = require('validate-npm-package-name')

class Parser {
  constructor({ directoryPath, manifestType } = {}) {
    this.directoryPath = directoryPath
    this.manifestType = manifestType
  }

  getDependencies() {
    if (this.manifestType === 'npm') {
      const projectManifest = require(path.resolve(path.join(this.directoryPath, 'package.json')))

      // @TODO need to also add here other sources for deps like peerDeps, etc
      const prodDependencies = Object.keys(projectManifest.dependencies)
      const devDependencies = Object.keys(projectManifest.devDependencies)

      const allDependencies = [].concat(prodDependencies, devDependencies)
      return allDependencies
    }

    return []
  }

  // @TODO need to also add here other sources for deps like peerDeps, etc
  isPackageInDeps({ packageManifest, packageName }) {
    if (packageManifest.dependencies[packageName]) {
      return true
    }

    if (packageManifest.devDependencies[packageName]) {
      return true
    }

    return false
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

  flattenDepTree(depTree) {
    const depList = []
    const _flattenDepTree = depTree => {
      for (const [depName, depObject] of Object.entries(depTree)) {
        depList.push(depName)
        if (depObject.dependencies) {
          _flattenDepTree(depObject.dependencies)
        }
      }
    }

    _flattenDepTree(depTree.dependencies)
    return depList
  }
}

module.exports = Parser
