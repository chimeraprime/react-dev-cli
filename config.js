const fs = require('fs-extra');

const defaultConfig = {
  get: (target, name) => {
    const getValue = defaultVal => target.hasOwnProperty(name) ? target[name] : defaultVal;

    switch (name) {
      case 'framework':
        return getValue('default');
      case 'root':
        return getValue('.');
      case 'stylesType':
        return getValue('css');

      default:
        return getValue(undefined);
    }
  },
};

const getConfig = () => {
  try {
    const config = fs.readFileSync(`${process.cwd()}/.rdc`, 'utf8');
    const jsonConfig = config ? JSON.parse(config) : {};

    return new Proxy(jsonConfig || {}, defaultConfig);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File .rdc not found!'.red);
      return new Proxy({}, defaultConfig);
    }
    throw error;
  }
};

module.exports = {
  defaultConfig,
  getConfig,
};
