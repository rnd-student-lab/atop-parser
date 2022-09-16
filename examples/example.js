/* eslint-disable no-console */
const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');

const {
  atopLogsToObject, getAtopFields, atopLogsToObjectStream,
} = require('../lib');

const sourcePath = path.join(__dirname, '..', 'test', 'raw.txt');
const outputPath = path.join(__dirname, '..', 'examples');

const parsePromisified = async () => {
  const file = await fsp.readFile(sourcePath);

  const data = await atopLogsToObject(file, {
    timestampFirst: false,
    labels: ['CPU', 'MEM', 'NET']
  });
  await fsp.writeFile(path.join(outputPath, 'file1.json'), JSON.stringify(data, null, 2));
};

const parseStreamified = async () => {
  const stream = fs.createReadStream(sourcePath);

  atopLogsToObjectStream(stream, {
    timestampFirst: true,
    labels: ['CPU', 'MEM', 'NET']
  }).map((item) => `${JSON.stringify(item)}\n`).pipe(fs.createWriteStream(path.join(outputPath, 'file2.json')));
};

const parseMixed = async () => {
  const stream = fs.createReadStream(sourcePath);

  const data = await atopLogsToObject(stream, {
    timestampFirst: true,
    labels: ['CPU', 'DSK', 'NET']
  });
  await fsp.writeFile(path.join(outputPath, 'file3.json'), JSON.stringify(data, null, 2));
};

(async () => {
  await parsePromisified();
  await parseStreamified();
  await parseMixed();

  console.log(getAtopFields());
})();
