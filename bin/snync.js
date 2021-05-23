#!/usr/bin/env node
'use strict'

const path = require('path')
const { argv } = require('process')
const { testProject } = require('../src')

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

  await testProject({ projectPath, log: console.log })
}
