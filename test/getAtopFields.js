import { expect } from 'chai';
import typeDetect from 'type-detect';
import { getAtopFields } from '../src';

describe('getAtopFields function', () => {
  const properties = [
    'CPU',
    'cpu',
    'CPL',
    'MEM',
    'SWP',
    'PAG',
    'LVM',
    'MDD',
    'DSK',
    'NET',
    'PRG',
    'PRC',
    'PRM',
    'PRD',
    'PRN',
  ];
  const fields = getAtopFields();

  describe('result', () => {
    it('should be an object', () => {
      expect(fields).to.be.an('Object');
    });

    it('should describe all atop labels', () => {
      expect(fields).to.have.all.keys(properties);
    });

    it('should contain an array of descriptions', () => {
      for (let i = 0; i < properties.length; i += 1) {
        expect(fields[properties[i]]).to.be.an('Array');
      }
    });
  });

  describe('every atop label in the result', () => {
    it('should contain an array of descriptions', () => {
      for (let i = 0; i < properties.length; i += 1) {
        expect(fields[properties[i]]).to.be.an('Array');
      }
    });
  });

  describe('every array in the atop labels', () => {
    it('should contain strings or arrays', () => {
      for (let i = 0; i < properties.length; i += 1) {
        for (let j = 0; j < fields[properties[i]].length; j += 1) {
          expect(typeDetect(fields[properties[i]][j])).to.be.oneOf(['string', 'Array']);
        }
      }
    });
  });
});
