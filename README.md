
<p align="center"><h1 align="center">
  snync
</h1>

<p align="center">
  Mitigate security concerns of Dependency Confusion supply chain security risks
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/snync"><img src="https://badgen.net/npm/v/snync" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/snync"><img src="https://badgen.net/npm/license/snync" alt="license"/></a>
  <a href="https://www.npmjs.org/package/snync"><img src="https://badgen.net/npm/dt/snync" alt="downloads"/></a>
  <a href="https://github.com/snyk-labs/snync/actions?workflow=CI"><img src="https://github.com/snyk-labs/snync/workflows/CI/badge.svg" alt="build"/></a>
  <a href="https://snyk.io/test/github/snyk-labs/snync"><img src="https://snyk.io/test/github/snyk-labs/snync/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

# About

Prevent Dependency Confusion supply chain security concerns 

# Install

```sh
npm install -g snync
```

# Usage

To scan a project's dependencies and test if you're vulnerable to Dependency Confusion security issues, where the project's git repository is cloned at `/home/user/my-app`:

```sh
npx snync /home/user/my-app
```
