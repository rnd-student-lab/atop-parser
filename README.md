# Atop parser

[![Build Status](https://travis-ci.org/rnd-student-lab/atop-parser.svg?branch=master)](https://travis-ci.org/rnd-student-lab/atop-parser)
[![dependencies Status](https://david-dm.org/rnd-student-lab/atop-parser/status.svg)](https://david-dm.org/rnd-student-lab/atop-parser)
[![devDependencies Status](https://david-dm.org/rnd-student-lab/atop-parser/dev-status.svg)](https://david-dm.org/rnd-student-lab/atop-parser?type=dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Atop parser is a library for converting atop utility logs to javascript objects.
It performs mapping of atop monitoring values to human-readable names.

For atop details see:

* https://linux.die.net/man/1/atop

## API

The library has three main functions:

* atopLogsToObjectStream
* atopLogsToObject
* getAtopFields

### atopLogsToObjectStream(logs[, options])

Creates a stream of objects mapping atop log values to human-readable object keys.
Each object represents a sample taken by atop monitor.

Function agruments:

* `logs` `<Highland.Stream> | <stream.Readable> | <String>` - can be a stream with atop log content or an entire log file text.
* `options` `<Object>` - options for managing function output.
  * `timestampFirst` `<Boolean>` - manages the order of object nesting.
    * If `true`, the object nesting is `timestamp->category->subcategory`
    * If `false`, the object nesting is `category->subcategory->timestamp`
  * `labels` `<Array<String>>` - array of atop labels to include in the output. Empty results in all labels to be returned, including process-level statistics.

Function output:

* `<Highland.Stream<Object>>` - stream of atop samples converted to objects with human-readable object keys.

### atopLogsToObject(logs[, options])

Creates a object with atop log values mapped to human-readable object keys.
This function might be useful when processing small atop log files or when picking very precise labels.

Function agruments:

* `logs` `<Highland.Stream> | <stream.Readable> | <String>` - can be a stream with atop log content or an entire log file text.
* `options` `<Object>` - options for managing function output.
  * `timestampFirst` `<Boolean>` - manages the order of object nesting.
    * If `true`, the object nesting is `timestamp->category->subcategory`
    * If `false`, the object nesting is `category->subcategory->timestamp`
  * `labels` `<Array<String>>` - array of atop labels to include in the output. Empty results in all labels to be returned, including process-level statistics.

Function output:

* `<Promise<Object>>` - merged object with human-readable object keys representing atop log data.

### getAtopFields()

Returns an object where keys are atop labels and values are lists of verbose descriptions for each position in atop log.
The same verbose descriptions are used as keys for objects in `atopLogsToObjectStream` and `atopLogsToObject` functions.

Be aware that NET label has two different sets of descriptions: one for upper network layers, and one for network interfaces.

* `<Object<String, Array<String | Array<String>>>>` - object describing atop fields for each label.

## Installation

Using npm:

```shell
npm i -s atop-parser
```

## Usage

### Exporting atop logs

To export atop logs one might use the following command:

```bash
atop -b 17:23:00 -e 17:24:00 -r -P ALL > ./raw.txt
```

### Parsing atop logs

In Node.js

Converting atop log file to JSON file using promises.

```js
const { atopLogsToObject } = require('atop-parser');

// ...

const file = await fs.readFile(path.join(inputPath, 'file1.txt'));

const data = await atopLogsToObject(file, {
  timestampFirst: false,
  labels: ['CPU', 'MEM', 'NET']
});
await fs.writeFile(path.join(outputPath, 'file1.json'), JSON.stringify(data, null, 2));
```

Converting atop log file to a file with every line representing a sample object using streams. Note, this is not a valid JSON file.

```js

const { atopLogsToObjectStream } = require('atop-parser');

// ...

const stream = fs.createReadStream(path.join(inputPath, 'file2.txt'));

atopLogsToObjectStream(stream, {
  timestampFirst: true,
  labels: ['CPU', 'MEM', 'NET']
})
  .map((item) => `${JSON.stringify(item)}\n`)
  .pipe(fs.createWriteStream(path.join(outputPath, 'file2.objects.txt')));
```

Converting atop log file to JSON file using stream for reading data only.

```js
const { atopLogsToObject } = require('atop-parser');

// ...

const stream = fs.createReadStream(path.join(inputPath, 'file3.txt'));

const data = await atopLogsToObject(stream, {
  timestampFirst: true,
  labels: ['CPU', 'DSK', 'NET']
});
await fsp.writeFile(path.join(outputPath, 'file3.json'), JSON.stringify(data, null, 2));
```

Printing all atop labels with corresponding verbose descriptions.

```js
const { getAtopFields } = require('atop-parser');

// ...

console.log(getAtopFields());
```

## License

MIT © Dmitry Ilin
