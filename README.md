---

<p align="center">
  <img src="https://user-images.githubusercontent.com/1620916/216589345-fb63dc6a-a052-440b-a26f-cc291a976b77.png">
</p>

---

![fox1t_disco_elysium_styled_storagebus_with_boxes_covered_by_clo_8b9e8a49-f59c-44a6-9c6e-58bdedc9ee3f](https://user-images.githubusercontent.com/1620916/216316357-92a5fe47-2adf-4e61-8a60-aaddf1ba8ad0.jpg)


[![CI](https://github.com/ducktors/storagebus/actions/workflows/ci.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/ci.yml) [![Test](https://github.com/ducktors/storagebus/actions/workflows/test.yml/badge.svg)](https://github.com/ducktors/storagebus/actions/workflows/test.yml) [![Coverage Status](https://coveralls.io/repos/github/ducktors/storagebus/badge.svg?branch=main)](https://coveralls.io/github/ducktors/storagebus?branch=main) [![Maintainability](https://api.codeclimate.com/v1/badges/40e86c80718286fa76b1/maintainability)](https://codeclimate.com/github/ducktors/storagebus/maintainability) [![storagebus](https://img.shields.io/npm/v/@ducktors/storagebus?label=storagebus)](https://www.npmjs.com/package/@ducktors/storagebus) [![storagebus-abstract](https://img.shields.io/npm/v/@ducktors/storagebus-abstract?label=storagebus-abstract)](https://www.npmjs.com/package/@ducktors/storagebus-abstract) [![storagebus-local](https://img.shields.io/npm/v/@ducktors/storagebus-local?label=storagebus-local)](https://www.npmjs.com/package/@ducktors/storagebus-local)
[![storagebus-gcs](https://img.shields.io/npm/v/@ducktors/storagebus-gcs?label=storagebus-gcs)](https://www.npmjs.com/package/@ducktors/storagebus-gcs)
[![storagebus-s3](https://img.shields.io/npm/v/@ducktors/storagebus-s3?label=storagebus-s3)](https://www.npmjs.com/package/@ducktors/storagebus-s3)
[![storagebus-memory](https://img.shields.io/npm/v/@ducktors/storagebus-memory?label=storagebus-memory)](https://www.npmjs.com/package/@ducktors/storagebus-memory) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Storagebus is a storage abstraction layer for Node.js that removes any difference among multiple public cloud storage services and local filesystems.

## Usage

You can use Storagebus with your filesystem, AWS and GCP:

```javascript
const { Storage } = require("storage/local");
// const { Storage } = require('storage/aws')
// const { Storage } = require('storage/gcp')
const { Readable } = require("node:stream");

const storage = new Storage({
  rootFolder: "path/to/folder",
});
// const storage = new Storage({
//  bucket: 'your-aws-bucket';
//  region: 'your-aws-region';
//  accessKeyId: 'your-aws-access-key';
//  secretAccessKey: 'your-aws-secret-access-key';
// })
// const storage = new Storage({
//  bucket: 'your-gcp-bucket';
//  projectId: 'your-gcp-project-id';
//  clientEmail: 'your-gcp-client-email';
//  privateKey: 'your-gcp-private-key';
// })

async function main() {
  // Your readable stream
  const readable = Readable.from("Hello, world!");

  // write a file
  const writtenFileString = await storage.write("your-file.txt", readable);

  // read a file from your storage
  const fileReadable = await storage.read("your-file.txt");

  // check for file existance in your storage
  const exist = await storage.exists("your-file.txt");

  // copy file
  const copiedFileString = await storage.copy(
    "your-file.txt",
    "your-file-copy.txt"
  );

  // move a file
  const movedFileString = await storage.move(
    "your-file-copy.txt",
    "moved/your-file-copy.txt"
  );

  // delete a file
  await storage.remove("your-file.txt");
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

## How to release

The release is performed by the maintainers of the repository. New versions are managed via [changesets](https://github.com/changesets/changesets).

To release a new version, simply choose which package to bump with `pnpm release` command:

```
$ pnpm release

> @ducktors/storagebus@0.9.0 release /ducktors-workstation/storagebus
> changeset

🦋  Which packages would you like to include? …
◯ unchanged packages
  ◯ @ducktors/storagebus-abstract
  ◯ @ducktors/storagebus-gcs
  ◯ @ducktors/storagebus-local
  ◯ @ducktors/storagebus-s3
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
