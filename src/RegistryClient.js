'use strict'

import undici from 'undici'

class RegistryClient {
  // @TODO should we instantiate with some configuration
  // such as supporting proxy settings and others?
  // constructor() {}

  async getPackageMetadataFromRegistry({ packageName }) {
    const { body } = await undici.request(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    const dataBuffer = []
    for await (const data of body) {
      dataBuffer.push(data)
    }

    const packageMetadata = Buffer.concat(dataBuffer).toString('utf8')
    const packageMetadataObject = JSON.parse(Buffer.from(packageMetadata).toString('utf8'))

    return packageMetadataObject
  }
}

export default RegistryClient
