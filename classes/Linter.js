const { exec } = require('child_process');
const fs = require('fs-extra');

const Enum = require('../utils/Enum');

const { supportedEslintConfigs } = require('../constants');

const customExec = command => {
  console.log('Executing:', command.gray, '\n');

  return new Promise((resolve, reject) => {
    exec(
      command,
      (error, stdout, stderr) => {
        console.log(stdout);
        stderr && console.log(`stderr: ${stderr}`);

        if (error !== null) {
          console.log(`exec error: ${error}`);
          reject();
        }

        resolve();
      });
  });
};

class Linter {
  constructor() {
    this.eslintPath = `${process.cwd()}/node_modules/.bin/eslint`;
    this.configProvider = 'chimeraPrime';
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
    const strategy = Array.isArray(config.extends)
      ? strategies.array
      : strategies.string;

    if (config.extends) {
      switch (strategy) {
        case strategies.string:
          if (config.extends !== this.CONFIG_NAME) {
            extendedConfig.extends = [
              config.extends,
              this.CONFIG_NAME,
            ];
          }
          break;

        case strategies.array:
          if (!config.extends.includes(this.CONFIG_NAME)) {
            extendedConfig.extends.push(this.CONFIG_NAME);
          }
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

  async installConfig() {
    await customExec(`yarn add ${this.CONFIG_NAME} -D`);

    this.installConfigPeerDeps();
  }

  installConfigPeerDeps() {
    const pkg = require(`${process.cwd()}/node_modules/${this.CONFIG_NAME}/package.json`);
    const entries = Object.entries(pkg.peerDependencies);
    const depsToInstall = entries.reduce((acc, [dep, version]) => {
      return `${acc} '${dep}@${version}'`;
    }, '');

    customExec(`yarn add ${depsToInstall} -D`);
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

  setup() {
    this.installConfig();
    this.createEslintConfigFile();
  }
}

module.exports = Linter;
