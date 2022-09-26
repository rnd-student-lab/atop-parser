import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import h from 'highland';
import { atopLogsToObject } from '../src';

describe('atopLogsToObject function', () => {
  const file = path.join(__dirname, 'raw.txt');

  describe('result', async () => {
    const promisifiedResult = atopLogsToObject(fs.createReadStream(file), {
      timestampFirst: true,
      labels: ['CPU', 'DSK', 'NET']
    });
    const result = await promisifiedResult;

    it('should be a promise', () => {
      expect(promisifiedResult).to.be.a('Promise');
    });

    it('should promise an object', async () => {
      expect(result).to.be.an('Object');
    });
  });

  describe('first agrument', async () => {
    it('should accept stream', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file));
      expect(result).to.be.an('Object');
    });

    it('should accept Highland stream', async () => {
      const result = await atopLogsToObject(h(fs.createReadStream(file)));
      expect(result).to.be.an('Object');
    });

    it('should accept string', async () => {
      const result = await atopLogsToObject(fs.readFileSync(file).toString());
      expect(result).to.be.an('Object');
    });
  });

  describe('second agrument', async () => {
    it('should process option "timestampFirst" set to "false"', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file), {
        timestampFirst: false,
      });
      expect(result).to.have.nested.property('CPU.default.1663241160.number of processors');
    });

    it('should process option "timestampFirst" set to "true"', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file), {
        timestampFirst: true,
      });
      expect(result).to.have.nested.property('1663241160.CPU.default.number of processors');
    });

    it('should process unspecified option "timestampFirst"', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file));
      expect(result).to.have.nested.property('CPU.default.1663241160.number of processors');
    });

    it('should process option "labels" set to specific list', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file), {
        labels: ['CPU', 'DSK'],
      });

      expect(result).to.have.nested.property('CPU.default.1663241160');
      expect(result).to.have.nested.property('DSK.sda.1663241160');
      expect(result).to.not.have.nested.property('MEM.default.1663241160');
    });

    it('should process option "labels" set to empty', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file), {
        labels: [],
      });

      expect(result).to.have.nested.property('CPU.default.1663241160');
      expect(result).to.have.nested.property('DSK.sda.1663241160');
      expect(result).to.have.nested.property('MEM.default.1663241160');
    });

    it('should process unspecified option "labels"', async () => {
      const result = await atopLogsToObject(fs.createReadStream(file));

      expect(result).to.have.nested.property('CPU.default.1663241160');
      expect(result).to.have.nested.property('DSK.sda.1663241160');
      expect(result).to.have.nested.property('MEM.default.1663241160');
    });
  });
});
