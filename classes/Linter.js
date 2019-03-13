const { exec } = require('child_process');
const fs = require('fs-extra');

const Enum = require('../utils/Enum');

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

    if (!this.isEslintInstalled) {
      throw new Error('Install eslint in the project!');
    }
  }

  static get CHIMERA_EXTEND() {
    return '@chimeraprime/eslint-config-chimera-prime';
  }
  static get CONFIG_PATH() {
    return `${process.cwd()}/.eslintrc`;
  }
  static getExtendedConfig(config = {}) {
    const extendedConfig = { ...config };
    const strategies = new Enum('string', 'array');
    const strategy = typeof config.extends === 'string' && config.extends !== Linter.CHIMERA_EXTEND
      ? strategies.string
      : Array.isArray(config.extends) && !config.extends.includes(Linter.CHIMERA_EXTEND)
        ? strategies.array
        : null;

    if (config.hasOwnProperty('extends')) {
      switch (strategy) {
        case strategies.string:
          extendedConfig.extends = [
            config.extends,
            Linter.CHIMERA_EXTEND,
          ];
          break;

        case strategies.array:
          extendedConfig.extends.push(Linter.CHIMERA_EXTEND);
          break;

        default:
          break;
      }
    } else {
      extendedConfig.extends = Linter.CHIMERA_EXTEND;
    }

    return extendedConfig;
  }

  fix(relPath) {
    customExec(`${this.eslintPath} ${process.cwd()}/${relPath} --fix --color`);
  }

  installEslint() {
    customExec('yarn add eslint babel-eslint eslint-plugin-react eslint-plugin-import -D');
  }

  installChimeraConfig() {
    customExec(`yarn add ${Linter.CHIMERA_EXTEND} -D`);
  }

  createChimeraEslintConfig() {
    let configToSave = {};

    try {
      const currentConfig = fs.readFileSync(Linter.CONFIG_PATH, 'utf8');
      const jsonConfig = JSON.parse(currentConfig);

      configToSave = Linter.getExtendedConfig(jsonConfig);
    } catch (error) {
      if (error.code === 'ENOENT') {
        configToSave.extends = Linter.CHIMERA_EXTEND;
      }
    } finally {
      fs.outputFileSync(Linter.CONFIG_PATH, JSON.stringify(configToSave, null, 2));
    }
  }

  setupChimeraEslint() {
    this.installEslint();
    this.installChimeraConfig();
    this.createChimeraEslintConfig();
  }
}

module.exports = Linter;
