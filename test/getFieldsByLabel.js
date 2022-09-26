import { expect } from 'chai';
import typeDetect from 'type-detect';
import { getFieldsByLabel } from '../src';

describe('getFieldsByLabel function', () => {
  const fields = getFieldsByLabel('MEM');

  describe('result', () => {
    it('should be an array', () => {
      expect(fields).to.be.an('Array');
    });
  });

  describe('array in the atop label', () => {
    it('should contain strings or arrays', () => {
      for (let i = 0; i < fields.length; i += 1) {
        expect(typeDetect(fields[i])).to.be.oneOf(['string', 'Array']);
      }
    });
  });
});
