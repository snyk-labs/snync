
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

Prevent and detect if you're vulnerable to Dependency Confusion supply chain security attacks 

# Intro

When you manage private open source packages, for reasons such as keeping intellectual property private, then these packages will be hosted and served via private registries, or require authorization. By definition, these packages won't exist on public registries. However, when a package name is used without a reserved namespace (also known as a scope in npm, for example), they are often free to be registered by any other user on the Internet and create a potential Dependency Confusion attack vector. The attack manifests due to a mix of user misconfiguration, and bad design of package managers, which will cause the download of the package from the public registry, instead of the private registry.

# How does it work?

This tool detects two types of potential Dependency Confusion compromises:
1. Vulnerable
2. Suspicious

## Vulnerable

A case of actual **vulnerable** package is when a package name is detected to be used in a project, but the same package name is not registered on the public registry.

You can easily simulate a real world example of this case in an npm project:
1. Edit the package.json file
2. Add to the `dependencies` key a new entry: `"snyk-private-internal-logic": "1.0.0"` and save the file (this assumes the package name `snyk-private-internal-logic` is not registered on npmjs.org).
3. Commit the file to the repository
4. Run `snync` to detect it.

When a package is detected as **vulnerable**, it is our recommendation to immediately reserve the name on the public registry.

## Suspicious

What happens if the private package name that you use is already registered on the public registry as a functional and unrelated package by someone else? In this case, you don't own the public package, but someone else does. Theoretically, this might not look as a problem because in a dependency confusion case the worst thing that can happen is the wrong package to be installed. However, that diminishes the potential threat model where a package can be hijacked and replaced by malicious versions of it, especially in cases of low-downloaded and unmaintained packages.

We've seen cases of package hijacking and maintainer accounts compromises in past supply chain security incidents such as `event-stream`, `mailparser`, and `eslint-config` as some examples of highly downloaded packages, and very active maintainers, yet still resulting in package compromises.

When a pakcage is detected as **suspicious**, it is our recommendation to immediately move to a new package naming and reserve that new name on the public registry.

## Supported ecosystems

| Ecosystem     | Supported 
| ------------- | ------------- 
| npm           | ✅  
| pypi          |   

# Install

```sh
npm install -g snync
```

## Prerequisite

To use this tool, it is expected that you have the following available in your environment:
1. Node.js and npm in stable and recent versions
2. The Git binary available in your path

# Usage

To scan a project's dependencies and test if you're vulnerable to Dependency Confusion security issues, where the project's git repository is cloned at `/home/user/my-app`:

```sh
npx snync /home/user/my-app
```

# Implementation details

To get a list of dependencies we parse a project's manifest (`package.json`) from the root of the directory you specify as a first argument.

Then we fetch from the public NPM registry to check when each dependency was created. At this point we can check if dependency is **vulnerable** – if it is not in the public NPM registry.

To check if dependency is **suspicious** we compare date it was first introduced to a project's manifest and date it was published. To understand when you added a dependency to a manifest we scan git commits history. 
