const fs = require('fs-extra');

const getConfig = () => {
  try {
    const config = fs.readFileSync('.rdc', 'utf8');
    const jsonConfig = config ? JSON.parse(config) : {};

    return jsonConfig;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File .rdc not found!'.red);
    } else {
      throw error;
    }
  }
};

module.exports = {
  getConfig,
};
