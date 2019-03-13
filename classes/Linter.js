const { exec } = require('child_process');
const fs = require('fs-extra');

const Enum = require('../utils/Enum');

const { supportedEslintConfigs } = require('../constants');

const customExec = command => {
  console.log('Executing:', command.gray, '\n');

  exec(
    command,
    (error, stdout, stderr) => {
      console.log(stdout);
      stderr && console.log(`stderr: ${stderr}`);

      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
};

class Linter {
  constructor() {
    this.eslintPath = `${process.cwd()}/node_modules/.bin/eslint`;
    this.isEslintInstalled = fs.existsSync(this.eslintPath);
    this.configProvider = 'chimeraPrime';

    if (!this.isEslintInstalled) {
      throw new Error('Install eslint in the project!');
    }
  }

  get CONFIG_NAME() {
    return supportedEslintConfigs[this.configProvider] || supportedEslintConfigs.chimeraPrime;
  }
  static get CONFIG_PATH() {
    return `${process.cwd()}/.eslintrc`;
  }

  getExtendedConfig(config = {}) {
    const extendedConfig = { ...config };
    const strategies = new Enum('string', 'array');
    const strategy = typeof config.extends === 'string' && config.extends !== this.CONFIG_NAME
      ? strategies.string
      : Array.isArray(config.extends) && !config.extends.includes(this.CONFIG_NAME)
        ? strategies.array
        : null;

    if (config.hasOwnProperty('extends')) {
      switch (strategy) {
        case strategies.string:
          extendedConfig.extends = [
            config.extends,
            this.CONFIG_NAME,
          ];
          break;

        case strategies.array:
          extendedConfig.extends.push(this.CONFIG_NAME);
          break;

        default:
          break;
      }
    } else {
      extendedConfig.extends = this.CONFIG_NAME;
    }

    return extendedConfig;
  }

  fix(relPath) {
    customExec(`${this.eslintPath} ${process.cwd()}/${relPath} --fix --color`);
  }

  installEslint() {
    customExec('yarn add eslint babel-eslint eslint-plugin-react eslint-plugin-import -D');
  }

  installConfig() {
    customExec(`yarn add ${this.CONFIG_NAME} -D`);
  }

  createEslintConfigFile() {
    let configToSave = {};

    try {
      const currentConfig = fs.readFileSync(Linter.CONFIG_PATH, 'utf8');
      const jsonConfig = JSON.parse(currentConfig);

      configToSave = this.getExtendedConfig(jsonConfig);
    } catch (error) {
      if (error.code === 'ENOENT') {
        configToSave.extends = this.CONFIG_NAME;
      }
    } finally {
      fs.outputFileSync(Linter.CONFIG_PATH, JSON.stringify(configToSave, null, 2));
    }
  }

  setupChimeraEslint() {
    this.installEslint();
    this.installConfig();
    this.createEslintConfigFile();
  }
}

module.exports = Linter;
