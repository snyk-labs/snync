'use strict'

const childProcess = require('child_process')
const fs = require('fs')
const git = require('isomorphic-git')

const Parser = require('./Parser')

class RepoManager {
  constructor({ directoryPath }) {
    this.directoryPath = directoryPath
    this.parser = new Parser()
  }

  getCommitsForFilepath({ filepath }) {
    const { stdout } = childProcess.spawnSync(
      'git',
      ['log', '--pretty=format:"%H"', '--first-parent', '--', filepath],
      { cwd: this.directoryPath }
    )
    const commitsString = Buffer.from(stdout).toString('utf8')
    const commitsList = commitsString.replace(/"/g, '').split('\n')
    // console.log("commitsList length:")
    // console.log(commitsList.length)

    return commitsList
  }

  getTimestampFromCommit({ commitObject }) {
    // see Commit object docs: https://isomorphic-git.org/docs/en/commit
    const timestampIntroducedToSource = {
      // number of seconds, unix epoch time
      timestamp: commitObject.commit.committer.timestamp,
      // number of minutes diff from committer time to UTC
      timezoneOffset: commitObject.commit.committer.timezoneOffset
    }

    const timezoneOffsetInSeconds = timestampIntroducedToSource.timezoneOffset * 60
    const timestampToUTC =
      timestampIntroducedToSource.timezoneOffset < 0
        ? timestampIntroducedToSource.timestamp - timezoneOffsetInSeconds
        : timestampIntroducedToSource.timestamp + timezoneOffsetInSeconds

    // make it a milliseconds precision timestamp so we can use it in JavaScript
    const timestampInMilliseconds = timestampToUTC * 1000

    return timestampInMilliseconds
  }

  async findFirstCommitIntroducingPackage(commitsList, packageName) {
    // commitsList array indexes
    var minIndex = 0
    var maxIndex = commitsList.length - 1

    var currentIndexPosition
    var currentCommit

    while (minIndex < maxIndex) {
      currentIndexPosition = Math.floor((minIndex + maxIndex) / 2)
      currentCommit = commitsList[currentIndexPosition]

      const commitObject = await git.readCommit({ fs, dir: this.directoryPath, oid: currentCommit })
      const commitFileTree = await git.readTree({
        fs,
        dir: this.directoryPath,
        oid: commitObject.oid
      })

      let packageManifestFile
      for (const fileTreeObject of commitFileTree.tree) {
        if (fileTreeObject.path === 'package.json') {
          const packageManifestObject = await git.readBlob({
            fs,
            dir: this.directoryPath,
            oid: fileTreeObject.oid
          })
          packageManifestFile = Buffer.from(packageManifestObject.blob).toString('utf8')
          break
        }
      }

      // @TODO move the JSON.parse() and the logic of reading the dep
      // from here to the Parser class
      const packageManifest = JSON.parse(packageManifestFile)
      const isPackageInDeps = this.parser.isPackageInDeps({
        packageManifest,
        packageName
      })

      if (isPackageInDeps) {
        minIndex = currentIndexPosition + 1
      } else {
        maxIndex = currentIndexPosition - 1
      }

      if (minIndex === maxIndex && maxIndex === commitsList.length - 1) {
        currentIndexPosition = minIndex
      }
    }

    // @TODO add debug for currentCommit as the commit that introduced the package
    currentCommit = commitsList[currentIndexPosition]
    const commitObject = await git.readCommit({ fs, dir: this.directoryPath, oid: currentCommit })
    return commitObject
  }
}

module.exports = RepoManager
