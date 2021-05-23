'use strict'

const childProcess = require('child_process')

class RepoManager {
  constructor({ directoryPath }) {
    this.directoryPath = directoryPath
  }

  getFileSnapshots({ filepath }) {
    const { stdout } = childProcess.spawnSync(
      'git',
      ['log', '--pretty=format:%ct %H', '--first-parent', '--', filepath],
      { cwd: this.directoryPath }
    )
    const commitsString = Buffer.from(stdout).toString('utf8')

    return commitsString.split('\n').map(line => {
      const [unixTs, hash] = line.split(' ')

      return {
        ts: unixTs * 1000,
        hash,
        content: this.getFileForCommit({
          hash,
          filepath
        })
      }
    })
  }

  getFileForCommit({ hash, filepath }) {
    const { stdout } = childProcess.spawnSync('git', ['show', `${hash}:${filepath}`], {
      cwd: this.directoryPath
    })
    return Buffer.from(stdout).toString('utf8')
  }
}

module.exports = RepoManager
