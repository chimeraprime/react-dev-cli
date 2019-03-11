const fs = require('fs-extra');
const defaultConfig = {
  framework: 'default',
  root: '.',
  stylesType: 'css',
};

function getConfig() {
  try {
    const config = fs.readFileSync(`${process.cwd()}/.rdc`, 'utf8');
    const jsonConfig = config ? JSON.parse(config) : {};

    return { ...jsonConfig, ...defaultConfig };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File .rdc not found!'.red);
      return defaultConfig;
    }
    throw error;
  }
}

function createConfigFile() {
  const configPath = `${process.cwd()}/.rdc`;

  if (!fs.existsSync(configPath)) {
    fs.outputFileSync(configPath, JSON.stringify(getConfig(), null, 2));
  }
}

module.exports = {
  defaultConfig,
  getConfig,
  createConfigFile,
};
