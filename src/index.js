import {
  map, zipObject, split, filter, castArray
} from 'lodash';
import h from 'highland';
import isStream from 'isstream';

import {
  objectStreamToObject,
  sampleStreamToObjectStream,
  DEFAULT_SUBCATEGORY
} from './internals';

import {
  CPU_TOTAL, CPU_TOTAL_FIELDS,
  CPU_CORE, CPU_CORE_FIELDS,
  CPU_LOAD, CPU_LOAD_FIELDS,
  MEMORY_OCCUPATION, MEMORY_OCCUPATION_FIELDS,
  SWAP, SWAP_FIELDS,
  PAGING_FREQUENCY, PAGING_FREQUENCY_FIELDS,
  DISK_UTILIZATION, DISK_UTILIZATION_FIELDS,
  LOGICAL_VOLUME_UTILIZATION, LOGICAL_VOLUME_UTILIZATION_FIELDS,
  MULTIPLE_DEVICE_UTILIZATION, MULTIPLE_DEVICE_UTILIZATION_FIELDS,
  NETWORK_UTILIZATION, NETWORK_UTILIZATION_FIELDS, NETWORK_UTILIZATION_UPPER_FIELDS
} from './labels/system';
import {
  PROCESS_GENERAL, PROCESS_GENERAL_FIELDS,
  PROCESS_CPU, PROCESS_CPU_FIELDS,
  PROCESS_MEMORY, PROCESS_MEMORY_FIELDS,
  PROCESS_DISK, PROCESS_DISK_FIELDS,
  PROCESS_NETWORK, PROCESS_NETWORK_FIELDS,
} from './labels/process';
import {
  BOOT, SEPARATOR,
} from './labels/common';

const getAtopFields = () => zipObject(
  [
    CPU_TOTAL,
    CPU_CORE,
    CPU_LOAD,
    MEMORY_OCCUPATION,
    SWAP,
    PAGING_FREQUENCY,
    LOGICAL_VOLUME_UTILIZATION,
    MULTIPLE_DEVICE_UTILIZATION,
    DISK_UTILIZATION,
    NETWORK_UTILIZATION,

    PROCESS_GENERAL,
    PROCESS_CPU,
    PROCESS_MEMORY,
    PROCESS_DISK,
    PROCESS_NETWORK,
  ],
  [
    CPU_TOTAL_FIELDS,
    CPU_CORE_FIELDS,
    CPU_LOAD_FIELDS,
    MEMORY_OCCUPATION_FIELDS,
    SWAP_FIELDS,
    PAGING_FREQUENCY_FIELDS,
    LOGICAL_VOLUME_UTILIZATION_FIELDS,
    MULTIPLE_DEVICE_UTILIZATION_FIELDS,
    DISK_UTILIZATION_FIELDS,
    // This is a specific case, see NET section https://linux.die.net/man/1/atop
    [NETWORK_UTILIZATION_UPPER_FIELDS, NETWORK_UTILIZATION_FIELDS],

    PROCESS_GENERAL_FIELDS,
    PROCESS_CPU_FIELDS,
    PROCESS_MEMORY_FIELDS,
    PROCESS_DISK_FIELDS,
    PROCESS_NETWORK_FIELDS,
  ]
);

const REG_EXP = /\(\)|[^\( \)]+/ig; // eslint-disable-line no-useless-escape

const getFieldsByLabel = (label) => getAtopFields()[label];

const dataStreamToSampleStream = (rawStream) => rawStream
  .splitBy(new RegExp(`${SEPARATOR}\n`))
  .compact()
  .map((sampleString) => {
    const sampleLines = split(sampleString, '\n');
    const noBootLineSampleLines = filter(sampleLines, (line) => (line !== BOOT));
    const entries = map(noBootLineSampleLines, (line) => map([...line.matchAll(REG_EXP)], '0'));
    return entries;
  });

const rawDataToHighlandStream = (data) => {
  if (h.isStream(data)) {
    return data;
  }
  return isStream(data) ? h(data) : h.of(data);
};

const rawDataToSampleStream = (data) => dataStreamToSampleStream(rawDataToHighlandStream(data));

const atopLogsToObjectStream = (logs, options = {}) => {
  const timestampFirst = options.timestampFirst || false;
  const labels = castArray(options.labels || []);

  const sampleStream = rawDataToSampleStream(logs);
  return sampleStreamToObjectStream(sampleStream, timestampFirst, labels);
};

const atopLogsToObject = async (logs, options) => {
  const objectStream = atopLogsToObjectStream(logs, options);
  return objectStreamToObject(objectStream);
};

// Common Labels
export * from './labels/common';
// System Level
export * from './labels/system';
// Process Level
export * from './labels/process';

export {
  DEFAULT_SUBCATEGORY,

  getAtopFields,
  getFieldsByLabel,

  atopLogsToObject,
  atopLogsToObjectStream,
};
