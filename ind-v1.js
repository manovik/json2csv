const fs = require('fs');
const promise = require('util').promisify;
const CONVERT_FROM = process.argv[2];
const CONVERT_TO = process.argv[3];

const readFile = promise(fs.readFile);
const append = promise(fs.appendFile);
const writeFile = promise(fs.writeFile);

const convertFrom = async () => {
  if (!/.json$/.test(CONVERT_FROM)) {
    throw `${CONVERT_FROM} should be a *.json file`;
  }
  return await readFile(CONVERT_FROM, 'utf8');
};

let myJson = null;

const parseJson = (data) => {
  const json = JSON.parse(data);
  myJson = json;
  return json;
};

const getKeys = (object) => {
  const allKeys = [];

  if (Array.isArray(object)) {
    object.forEach((obj, i) => {
      allKeys.push(...getKeys(obj));
    });
  } else {
    for (let key of Object.keys(object)) {
      allKeys.push(key);
    }
  }
  return allKeys;
};

const getAllUniqueKeys = (data) => {
  const arr = getKeys(data);

  return new Set(arr);
};

const writeColumns = (data) => {
  const arr = [...data];
  const str = arr.join(',');

  writeFile(CONVERT_TO, str);
  append(CONVERT_TO, '\n');
  return arr;
};

const appendFunc = async (text) => {
  await append(CONVERT_TO, text);
};

const writeEverythingElse = (set, data) => {
  data.forEach((obj, j) => {
    for (let i = 0; i < set.length; i++) {
      if (obj[set[i]]) {
        appendFunc(`${obj[set[i]]},`);
      } else {
        appendFunc(',');
      }
    }
    if (data[j + 1]) {
      appendFunc('\n');
    }
  });
};

convertFrom()
  .then(parseJson)
  .then(getAllUniqueKeys)
  .then(writeColumns)
  .then((set) => {
    writeEverythingElse(set, myJson);
  });
