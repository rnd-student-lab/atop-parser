import { expect } from 'chai';
import typeDetect from 'type-detect';
import { getAtopFields } from '../src';

// TBD

describe('Check getAtopFields function.', () => {
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

  it('should be an object', () => {
    const fields = getAtopFields();
    expect(fields).to.be.an('Object');
  });

  it('should describe all atop labels', () => {
    const fields = getAtopFields();
    expect(fields).to.have.all.keys(properties);
  });

  it('every label must contain an array of descriptions', () => {
    const fields = getAtopFields();
    for (let i = 0; i < properties.length; i += 1) {
      expect(fields[properties[i]]).to.be.an('Array');
    }
  });

  it('every array of descriptions must contain strings or arrays', () => {
    const fields = getAtopFields();
    for (let i = 0; i < properties.length; i += 1) {
      for (let j = 0; j < fields[properties[i]].length; j += 1) {
        expect(typeDetect(fields[properties[i]][j])).to.be.oneOf(['string', 'Array']);
      }
    }
  });
});
