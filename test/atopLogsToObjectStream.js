/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import h from 'highland';
import { atopLogsToObjectStream } from '../src';

describe('atopLogsToObjectStream function', () => {
  const file = path.join(__dirname, 'raw.txt');

  describe('result', () => {
    const stream = atopLogsToObjectStream(fs.createReadStream(file), {
      timestampFirst: true,
      labels: ['CPU', 'DSK', 'NET']
    });

    it('should be a HighlandStream', () => {
      expect(h.isStream(stream)).to.be.true;
    });
  });

  describe('first agrument', () => {
    it('should accept stream', () => {
      const stream = atopLogsToObjectStream(fs.createReadStream(file));
      expect(h.isStream(stream)).to.be.true;
    });

    it('should accept Highland stream', () => {
      const stream = atopLogsToObjectStream(h(fs.createReadStream(file)));
      expect(h.isStream(stream)).to.be.true;
    });

    it('should accept string', () => {
      const stream = atopLogsToObjectStream(fs.readFileSync(file).toString());
      expect(h.isStream(stream)).to.be.true;
    });
  });

  describe('second agrument', async () => {
    it('should process option "timestampFirst" set to "false"', async () => {
      const result = await atopLogsToObjectStream(fs.createReadStream(file), {
        timestampFirst: false,
      }).head().toPromise(Promise);
      expect(result).to.have.nested.property('CPU.default.1663241160.number of processors');
    });

    it('should process option "timestampFirst" set to "true"', async () => {
      const result = await atopLogsToObjectStream(fs.createReadStream(file), {
        timestampFirst: true,
      }).head().toPromise(Promise);
      expect(result).to.have.nested.property('1663241160.CPU.default.number of processors');
    });

    it('should process unspecified option "timestampFirst"', async () => {
      const result = await atopLogsToObjectStream(fs.createReadStream(file))
        .head().toPromise(Promise);
      expect(result).to.have.nested.property('CPU.default.1663241160.number of processors');
    });

    it('should process option "labels" set to specific list', async () => {
      const result = await atopLogsToObjectStream(fs.createReadStream(file), {
        labels: ['CPU', 'DSK'],
      }).head().toPromise(Promise);

      expect(result).to.have.nested.property('CPU.default.1663241160');
      expect(result).to.have.nested.property('DSK.sda.1663241160');
      expect(result).to.not.have.nested.property('MEM.default.1663241160');
    });

    it('should process option "labels" set to empty', async () => {
      const result = await atopLogsToObjectStream(fs.createReadStream(file), {
        labels: [],
      }).head().toPromise(Promise);

      expect(result).to.have.nested.property('CPU.default.1663241160');
      expect(result).to.have.nested.property('DSK.sda.1663241160');
      expect(result).to.have.nested.property('MEM.default.1663241160');
    });

    it('should process unspecified option "labels"', async () => {
      const result = await atopLogsToObjectStream(fs.createReadStream(file))
        .head().toPromise(Promise);

      expect(result).to.have.nested.property('CPU.default.1663241160');
      expect(result).to.have.nested.property('DSK.sda.1663241160');
      expect(result).to.have.nested.property('MEM.default.1663241160');
    });
  });
});
