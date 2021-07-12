#!/usr/bin/env node
'use strict'

import path from 'path'
import { testProject } from '../src/main.js'
import meow from 'meow'

const cli = meow(
  `
  Usage
    $ snync --directory ~/projects/my-app [options]

  Options
    --directory  -d  Path to a project's source-code directory with a package.json
    --private    -p  Specify name of private packages (repeat as needed)
    --debug      -x  Enable debugging when printing data

  Examples
    $ snync --directory ~/projects/my-app -p "my-private-package-name" -p "my-other-private-package"
`,
  {
    importMeta: import.meta,
    flags: {
      directory: {
        type: 'string',
        alias: 'd'
      },
      private: {
        type: 'string',
        alias: 'p'
      },
      debug: {
        type: 'boolean',
        alias: 'x'
      }
    }
  }
)

main()

async function main() {
  let projectPath

  if (cli.flags.directory) {
    projectPath = path.resolve(cli.flags.directory)
    console.log(`Testing project at: ${projectPath}`)
  } else {
    console.error(`error: please provide a directory path to the git project to test.`)
    console.error(cli.help)
    process.exit(-1)
  }

  await testProject({
    projectPath,
    log: console.log,
    debug: cli.flags.debug,
    privatePackagesList: cli.flags.private
  })
}
