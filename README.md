# Atop parser

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-airbnb-red.svg)](https://standardjs.com)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/atop-parser)
[![downloads per month](http://img.shields.io/npm/dm/atop-parser.svg)](https://www.npmjs.org/package/atop-parser)
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

### getFieldsByLabel(label)

Returns a list of verbose descriptions (for the specified label only) for each position in atop log.
A simple shorthand for `getAtopFields()[label]`

Be aware that NET label has two different sets of descriptions: one for upper network layers, and one for network interfaces.

* `<String, Array<String | Array<String>>>` - description of atop fields for the specified label.

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

### Example result

Assuming we run atopLogsToObject() function with `timestampFirst` set to `true` and `labels` set to `['CPU']`.
Given the input file with atop statistics has only the following entry:

```tsv
CPU bi-ca-server-0 1663241160 2022/09/15 11:26:00 1 100 2 3 1 0 195 0 0 1 0 0 7200 100 0 0
SEP
```

The result of the parsing will be:

```json
{
  "1663241160": {
    "CPU": {
      "default": {
        "total number of clock-ticks per second for this machine": "100",
        "number of processors": "2",
        "consumption for all CPU's in system mode (clock-ticks)": "3",
        "consumption for all CPU's in user mode (clock-ticks)": "1",
        "consumption for all CPU's in user mode for niced processes (clock-ticks)": "0",
        "consumption for all CPU's in idle mode (clock-ticks)": "195",
        "consumption for all CPU's in wait mode (clock-ticks)": "0",
        "consumption for all CPU's in irq mode (clock-ticks)": "0",
        "consumption for all CPU's in softirq mode (clock-ticks)": "1",
        "consumption for all CPU's in steal mode (clock-ticks)": "0",
        "consumption for all CPU's in guest mode (clock-ticks)": "0"
      }
    }
  }
}
```

## License

MIT © Dmitry Ilin
