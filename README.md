# Storage🚌

[![CI](https://github.com/ducktors/storagebus/actions/workflows/ci.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/ci.yml) [![Coverage Status](https://coveralls.io/repos/github/ducktors/storagebus/badge.svg?branch=main)](https://coveralls.io/github/ducktors/storagebus?branch=main) [![CodeQL](https://github.com/ducktors/storagebus/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/codeql-analysis.yml) [![OSSAR](https://github.com/ducktors/storagebus/actions/workflows/ossar-analysis.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/ossar-analysis.yml) [![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section --> [![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-) <!-- ALL-CONTRIBUTORS-BADGE:END -->

Storagebus is a storage abstraction layer for Node.js that removes any difference among multiple public cloud storage services and local filesystems.

## Usage

You can use Storagebus with your filesystem, AWS and GCP:

```
const { Storage } = require('storage/local')
// const { Storage } = require('storage/aws')
// const { Storage } = require('storage/gcp')
const { Readable } = require('node:stream')

const storage = new Storage({
  rootFolder: 'path/to/folder'
})
// const storage = new Storage({
//  bucket: 'your-bucket';
//  region: 'your region';
//  accessKeyId: 'your-access-key';
//  secretAccessKey: 'your-secret-access-key';
// })
// const storage = new Storage({
//  bucket: 'your-bucket';
//  projectId: 'your-project-id';
//  clientEmail: 'your-client-email';
//  privateKey: 'your-private-key';
// })

async function main() {
  // Your readable stream
  const readable = new Readable()
  readable.push('Hello, world!')

  // write a file
  const writtenFileString = await storage.write('your-file.txt', readable)

  // read a file from your storage
  const fileReadable = await storage.read('your-file.txt')

  // check for file existance in your storage
  const exist = await storage.read('your-file.txt')

  // copy file
  const copiedFileString = await storage.copy('your-file.txt', 'your-file-copy.txt')

  // move a file
  const movedFileString = await storage.move('your-file-copy.txt', 'copied/your-file-copy.txt')

  // delete a file
  await storage.remove('your-file.txt', 'your-file-copy.txt')
}
```

## Contribute to this project

1. Clone this repository

   `git clone git@github.com:github.com/ducktors/storagebus.git`

2. Move inside repository folder

   `cd storagebus`

3. Install dependencies

   `pnpm install`

4. Run the project in development mode

   `pnpm dev`

## How to commit

This repo uses [Semantic Release](https://github.com/semantic-release/semantic-release) with Conventional Commits.
Releases are automatically created based on the type of commit message: feat for minor and fix for patch.

```
feat: new feature ---> 1.x.0
fix: fix a bug ---> 1.0.x
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://maksim.dev"><img src="https://avatars.githubusercontent.com/u/1620916?v=4?s=100" width="100px;" alt="Maksim Sinik"/><br /><sub><b>Maksim Sinik</b></sub></a><br /><a href="https://github.com/ducktors/storagebus/commits?author=fox1t" title="Code">💻</a> <a href="https://github.com/ducktors/storagebus/commits?author=fox1t" title="Tests">⚠️</a> <a href="https://github.com/ducktors/storagebus/commits?author=fox1t" title="Documentation">📖</a> <a href="#maintenance-fox1t" title="Maintenance">🚧</a> <a href="#ideas-fox1t" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-fox1t" title="Mentoring">🧑‍🏫</a></td>
      <td align="center"><a href="http://matteovivona.it"><img src="https://avatars.githubusercontent.com/u/6388707?v=4?s=100" width="100px;" alt="Matteo Vivona"/><br /><sub><b>Matteo Vivona</b></sub></a><br /><a href="#infra-tehKapa" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-tehKapa" title="Security">🛡️</a> <a href="https://github.com/ducktors/storagebus/commits?author=tehKapa" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
