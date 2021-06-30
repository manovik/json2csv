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

const writeEverythingElse = (set, data) => {
  const wrStream = fs.createWriteStream(CONVERT_TO, {
    flags: 'as',
    emitClose: true,
    encoding: 'utf-8',
  });
  data.forEach((obj, j) => {
    for (let i = 0; i < set.length; i++) {
      if (obj[set[i]]) {
        wrStream.write(`${obj[set[i]]}`);
        if(set[i + 1]) {
          wrStream.write(',');
        }
      } else {
        wrStream.write(',');
      }
    }
    if (data[j + 1]) {
      wrStream.write('\r\n');
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
