const fs = require('fs-extra');
const path = require('path');
const replace = require('replace');

const templates = require('../templates/component');
const { getTemplate } = require('./StrategyService');

const { capitalize } = require('../utils');

const defaultOptions = {
  get: (target, name) => {
    const getValue = defaultVal => target.hasOwnProperty(name) ? target[name] : defaultVal;

    switch (name) {
      case 'subfolder':
        return getValue('components');

      default:
        return getValue(undefined);
    }
  },
};

class Component {
  constructor(args = {}) {
    const { component = '' } = args;
    const options = new Proxy(args.options || {}, defaultOptions);

    const componentsPath = path.normalize(`${Component.getConfig().root}/${options.subfolder}`);
    const rootPath = path.normalize(Component.getConfig().root);
    const componentDirs = component.split('/');

    this.options = options;

    this.componentName = capitalize(componentDirs[componentDirs.length - 1]);
    this.componentPath = component.split('/').map(item => capitalize(item)).join('/');
    this.componentsPath = fs.existsSync(componentsPath) ? componentsPath : rootPath;
    this.folderPath = path.normalize(`${this.componentsPath}/${this.componentPath}`);
    this.filePath = path.normalize(`${this.folderPath}/${this.componentName}`);
  }

  static getConfig() {
    return require('../config').getConfig();
  }

  replaceClassName(path) {
    if (fs.existsSync(path)) {
      replace({
        regex: ':className',
        replacement: this.componentName,
        paths: [path],
        recursive: false,
        silent: true,
      });
    }
  }

  generateComponent() {
    const template = getTemplate({
      strategy: Component.getConfig().framework,
      options: this.options,
    });

    this.writeComponentStructure(template);
  }

  writeComponentStructure(template) {
    this.writeComponentFile(template);

    if (this.options.style) {
      this.writeStylesFile();
    }

    this.writeComponentIndexFile();
    this.manageComponentsIndexFile();
  }

  writeComponentFile(template) {
    const absolutePath = `${process.cwd()}/${this.filePath}.js`;

    if (!fs.existsSync(absolutePath)) {
      try {
        console.log('creating component file...');
        fs.outputFileSync(absolutePath, template);
        this.replaceClassName(`${this.filePath}.js`);
        console.log(`Component ${this.componentName} created at ${this.filePath}.js`.cyan);
      } catch (error) {
        throw error;
      }
    } else {
      console.log(`Component ${this.componentName} already exists at ${this.filePath}.js, choose another name if you want to create a new component`.red);
    }
  }

  writeStylesFile() {
    const stylesAbsolutePath = `${process.cwd()}/${this.filePath}.${Component.getConfig().stylesType}`;

    if (!fs.existsSync(stylesAbsolutePath)) {
      console.log('creating syles...');
      fs.outputFileSync(stylesAbsolutePath, '');
      console.log(`Stylesheet ${this.componentName} created at ${this.filePath}.${Component.getConfig().stylesType}`.cyan);
    } else {
      console.log(`Stylesheet ${this.componentName} allready exists at ${this.filePath}.${Component.getConfig().stylesType}, choose another name if you want to create a new stylesheet`.red);
    }
  }

  writeComponentIndexFile() {
    const absoluteIndexPath = path.normalize(`${process.cwd()}/${this.folderPath}/index.js`);

    if (!fs.existsSync(absoluteIndexPath)) {
      try {
        fs.outputFileSync(absoluteIndexPath, templates.indexes.default);
        this.replaceClassName(absoluteIndexPath);
        console.log(`Index file for ${this.componentName} created at ${absoluteIndexPath}`.cyan);
      } catch (error) {
        throw error;
      }
    } else {
      console.log(`Index file for ${this.componentName} has been already added`.red);
    }
  }

  manageComponentsIndexFile() {
    const absoluteIndexPath = path.normalize(`${process.cwd()}/${this.componentsPath}/index.js`);
    const exportFromPath = `./${this.componentPath}`;
    const content = templates.indexes.named
      .replace(/:className/gi, capitalize(this.componentName))
      .replace(/:basePath/gi, exportFromPath);

    if (fs.existsSync(absoluteIndexPath)) {
      this.updateComponentsIndexFile(absoluteIndexPath, content);
    } else {
      this.createComponentsIndexFile(absoluteIndexPath, content);
    }
  }

  createComponentsIndexFile(path, content) {
    try {
      fs.outputFileSync(path, content);
      console.log(`Index file for ${this.componentPath} created at ${path}`.cyan);
    } catch (error) {
      throw error;
    }
  }

  updateComponentsIndexFile(path, content) {
    try {
      const indexContent = fs.readFileSync(path, 'utf8');
      const indexContentLines = indexContent.split('\n').filter((item, index, arr) => {
        const isLastIndex = index + 1 === arr.length;

        return !isLastIndex && !!item;
      });

      if (!indexContentLines.includes(content)) {
        indexContentLines.push(content);

        const indexContentToSave = indexContentLines.join('\n') + '\n';

        fs.outputFileSync(path, indexContentToSave);

        console.log(`Component ${this.componentPath} has been exported`.cyan);
      } else {
        console.log(`Component ${this.componentPath} has been already exported`.red);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Component;
