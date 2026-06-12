---

<p align="center">
  <img src="https://user-images.githubusercontent.com/1620916/216589345-fb63dc6a-a052-440b-a26f-cc291a976b77.png">
</p>

---

![fox1t_disco_elysium_styled_storagebus_with_boxes_covered_by_clo_8b9e8a49-f59c-44a6-9c6e-58bdedc9ee3f](https://user-images.githubusercontent.com/1620916/216316357-92a5fe47-2adf-4e61-8a60-aaddf1ba8ad0.jpg)


[![CI](https://github.com/ducktors/storagebus/actions/workflows/ci.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/ci.yml) [![Test](https://github.com/ducktors/storagebus/actions/workflows/test.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/test.yml) [![Coverage Status](https://coveralls.io/repos/github/ducktors/storagebus/badge.svg?branch=main)](https://coveralls.io/github/ducktors/storagebus?branch=main) [![Maintainability](https://api.codeclimate.com/v1/badges/40e86c80718286fa76b1/maintainability)](https://codeclimate.com/github/ducktors/storagebus/maintainability) [![storage](https://img.shields.io/npm/v/@storagebus/storage?label=storage)](https://www.npmjs.com/package/@storagebus/storage) [![local](https://img.shields.io/npm/v/@storagebus/local?label=local)](https://www.npmjs.com/package/@storagebus/local)
[![memory](https://img.shields.io/npm/v/@storagebus/memory?label=memory)](https://www.npmjs.com/package/@storagebus/memory) [![gcs](https://img.shields.io/npm/v/@storagebus/gcs?label=gcs)](https://www.npmjs.com/package/@storagebus/gcs)
[![s3](https://img.shields.io/npm/v/@storagebus/s3?label=s3)](https://www.npmjs.com/package/@storagebus/s3) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

StorageBus is a storage abstraction layer for Node.js that removes differences among public cloud storage services, local filesystems, and in-memory storage.

## Usage

StorageBus v1 has two core operations:

- `write(objectKey, data)` writes, replaces, or deletes an object.
- `file(objectKey)` returns a `BusFile`, which can stream content and expose metadata.

You can use StorageBus with your filesystem, AWS S3, Google Cloud Storage, or memory:

```typescript
import { Readable } from 'node:stream'
import { Storage } from '@storagebus/storage'
import { createAdapter } from '@storagebus/local'

const storage = new Storage(createAdapter({ root: '/path/to/folder' }))

async function main() {
  const objectKey = await storage.write('hello.txt', 'Hello, world!')
  const file = await storage.file(objectKey)

  console.log(file.name)
  console.log(file.type)
  console.log(file.size)
  console.log(await file.text())

  await storage.write('stream.txt', () => Readable.from('stream content'))

  // Passing null deletes the Object Key.
  await storage.write('hello.txt', null)
}
```

## Packages

- `@storagebus/storage`: core `Storage`, `BusFile`, Adapter contract, shared errors, and compliance tests.
- `@storagebus/memory`: in-memory Adapter.
- `@storagebus/local`: local filesystem Adapter.
- `@storagebus/s3`: AWS S3 Adapter.
- `@storagebus/gcs`: Google Cloud Storage Adapter.

## Migration to v1

StorageBus v1 creates Storage from the core package and injects an Adapter from the target Storage Backend package.

Before v1:

```typescript
import { createStorage } from '@storagebus/local'

const storage = createStorage({ root: '/path/to/folder' })
```

In v1:

```typescript
import { Storage } from '@storagebus/storage'
import { createAdapter } from '@storagebus/local'

const storage = new Storage(createAdapter({ root: '/path/to/folder' }))
```

Storage options such as `debug`, `logger`, and `sanitizeKey` now belong to `Storage`, not Adapter packages:

```typescript
const storage = new Storage(createAdapter({ root: '/path/to/folder' }), {
  sanitizeKey: true,
})
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

## How to release

The release is performed by the maintainers of the repository. New versions are managed via [changesets](https://github.com/changesets/changesets).

To release a new version, simply choose which package to bump with `pnpm release` command:

```
$ pnpm release

> @ducktors/storagebus@0.9.0 release /ducktors-workstation/storagebus
> changeset

🦋  Which packages would you like to include? …
◯ unchanged packages
  ◯ @storagebus/storage
  ◯ @storagebus/gcs
  ◯ @storagebus/local
  ◯ @storagebus/s3
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://maksim.dev"><img src="https://avatars.githubusercontent.com/u/1620916?v=4?s=100" width="100px;" alt="Maksim Sinik"/><br /><sub><b>Maksim Sinik</b></sub></a><br /><a href="https://github.com/ducktors/storagebus/commits?author=fox1t" title="Code">💻</a> <a href="https://github.com/ducktors/storagebus/commits?author=fox1t" title="Tests">⚠️</a> <a href="#ideas-fox1t" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-fox1t" title="Maintenance">🚧</a> <a href="#mentoring-fox1t" title="Mentoring">🧑‍🏫</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://matteovivona.it"><img src="https://avatars.githubusercontent.com/u/6388707?v=4?s=100" width="100px;" alt="Matteo Vivona"/><br /><sub><b>Matteo Vivona</b></sub></a><br /><a href="#infra-tehKapa" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#security-tehKapa" title="Security">🛡️</a> <a href="https://github.com/ducktors/storagebus/commits?author=tehKapa" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/andrew-hu368"><img src="https://avatars.githubusercontent.com/u/45509582?v=4?s=100" width="100px;" alt="Andrew Hu"/><br /><sub><b>Andrew Hu</b></sub></a><br /><a href="https://github.com/ducktors/storagebus/commits?author=andrew-hu368" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fooddilsn"><img src="https://avatars.githubusercontent.com/u/29302520?v=4?s=100" width="100px;" alt="Alessandro Di Dio"/><br /><sub><b>Alessandro Di Dio</b></sub></a><br /><a href="https://github.com/ducktors/storagebus/commits?author=fooddilsn" title="Code">💻</a></td>
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
