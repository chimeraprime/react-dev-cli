const fs = require('fs-extra');

const defaults = {
  root: '.',
  stylesType: 'css',
};

const getConfig = () => {
  try {
    const config = fs.readFileSync(`${process.cwd()}/.rdc`, 'utf8');
    const jsonConfig = config ? JSON.parse(config) : {};

    Object.entries(defaults).forEach(([key, value]) => {
      if (!jsonConfig[key]) {
        jsonConfig[key] = value;
      }
    });

    return jsonConfig;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File .rdc not found!'.red);
      return defaults;
    }
    throw error;
  }
};

module.exports = {
  defaults,
  getConfig,
};
