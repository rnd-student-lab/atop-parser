import {
  map, zip, zipObject, each, setWith, merge, isEmpty, includes, partial
} from 'lodash';
import h from 'highland';

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

export const DEFAULT_SUBCATEGORY = 'default';

const objectStreamToObject = async (objectStream) => h(objectStream)
  .reduce1((acc, obj) => merge(acc, obj)).toPromise(Promise);

const categoryFirstPath = (category, subcategory, timestamp) => [category, subcategory, timestamp];
const timestampFirstPath = (category, subcategory, timestamp) => [timestamp, category, subcategory];

const applyFields = (obj, entry, pathFunction, category, subcategory, fields) => {
  const tuples = map(fields, (field, index) => [field, entry[index + 6]]);
  const timestamp = entry[2];

  setWith(
    obj,
    pathFunction(category, subcategory, timestamp),
    zipObject(...zip(...tuples)),
    Object
  );
};

const parseEntry = (obj, entry, pathFunction, labels) => {
  if (!isEmpty(labels) && !includes(labels, entry[0])) {
    return;
  }
  const applyFieldsWith = partial(applyFields, obj, entry, pathFunction);

  switch (entry[0]) {
    case CPU_TOTAL:
      applyFieldsWith(CPU_TOTAL, DEFAULT_SUBCATEGORY, CPU_TOTAL_FIELDS);
      break;
    case CPU_CORE:
      applyFieldsWith(CPU_CORE, entry[7], CPU_CORE_FIELDS);
      break;
    case CPU_LOAD:
      applyFieldsWith(CPU_LOAD, DEFAULT_SUBCATEGORY, CPU_LOAD_FIELDS);
      break;
    case MEMORY_OCCUPATION:
      applyFieldsWith(MEMORY_OCCUPATION, DEFAULT_SUBCATEGORY, MEMORY_OCCUPATION_FIELDS);
      break;
    case SWAP:
      applyFieldsWith(SWAP, DEFAULT_SUBCATEGORY, SWAP_FIELDS);
      break;
    case PAGING_FREQUENCY:
      applyFieldsWith(PAGING_FREQUENCY, DEFAULT_SUBCATEGORY, PAGING_FREQUENCY_FIELDS);
      break;
    case DISK_UTILIZATION:
      applyFieldsWith(DISK_UTILIZATION, entry[6], DISK_UTILIZATION_FIELDS);
      break;
    case LOGICAL_VOLUME_UTILIZATION:
      applyFieldsWith(LOGICAL_VOLUME_UTILIZATION, entry[6], LOGICAL_VOLUME_UTILIZATION_FIELDS);
      break;
    case MULTIPLE_DEVICE_UTILIZATION:
      applyFieldsWith(MULTIPLE_DEVICE_UTILIZATION, entry[6], MULTIPLE_DEVICE_UTILIZATION_FIELDS);
      break;
    case NETWORK_UTILIZATION:
      if (entry[6] === 'upper') {
        applyFieldsWith(NETWORK_UTILIZATION, entry[6], NETWORK_UTILIZATION_UPPER_FIELDS);
      } else {
        applyFieldsWith(NETWORK_UTILIZATION, entry[6], NETWORK_UTILIZATION_FIELDS);
      }
      break;
    case PROCESS_GENERAL:
      applyFieldsWith(PROCESS_GENERAL, entry[6], PROCESS_GENERAL_FIELDS);
      break;
    case PROCESS_CPU:
      applyFieldsWith(PROCESS_CPU, entry[6], PROCESS_CPU_FIELDS);
      break;
    case PROCESS_MEMORY:
      applyFieldsWith(PROCESS_MEMORY, entry[6], PROCESS_MEMORY_FIELDS);
      break;
    case PROCESS_DISK:
      applyFieldsWith(PROCESS_DISK, entry[6], PROCESS_DISK_FIELDS);
      break;
    case PROCESS_NETWORK:
      applyFieldsWith(PROCESS_NETWORK, entry[6], PROCESS_NETWORK_FIELDS);
      break;
    default:
      break;
  }
};

const sampleStreamToObjectStream = (sampleStream, timestampFirst, labels) => {
  const pathFunction = timestampFirst ? timestampFirstPath : categoryFirstPath;

  return h(sampleStream)
    .map((sampleLines) => {
      const sampleObject = {};
      each(sampleLines, (line) => {
        parseEntry(sampleObject, line, pathFunction, labels);
      });
      return sampleObject;
    });
};

export {
  objectStreamToObject,
  sampleStreamToObjectStream,
};
