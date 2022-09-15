# Atop parser

[![Build Status](https://travis-ci.org/rnd-student-lab/atop-parser.svg?branch=master)](https://travis-ci.org/rnd-student-lab/atop-parser)
[![dependencies Status](https://david-dm.org/rnd-student-lab/atop-parser/status.svg)](https://david-dm.org/rnd-student-lab/atop-parser)
[![devDependencies Status](https://david-dm.org/rnd-student-lab/atop-parser/dev-status.svg)](https://david-dm.org/rnd-student-lab/atop-parser?type=dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Atop parser is a library for converting atop utility logs to javascript objects.
It performs mapping of atop monitoring values to human-readable names.

For Atop details see:

* https://linux.die.net/man/1/atop

## API

TBD

## Installation

Using npm:

```shell
npm i -s atop-parser
```

## Usage

In Node.js

```js
TBD
```

## Exporting Atop logs

```bash
atop -b 17:23:00 -e 17:24:00 -r -P ALL > ./raw.txt
```

## License

MIT © Dmitry Ilin
