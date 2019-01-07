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
      console.log('creating component file...');
      fs.outputFile(absolutePath, template, err => {
        if (err) throw err;
        replace({
          regex: ':className',
          replacement: this.componentName,
          paths: [`${this.filePath}.js`],
          recursive: false,
          silent: true,
        });
        console.log(`Component ${this.componentName} created at ${this.filePath}.js`.cyan);
      });
    } else {
      console.log(`Component ${this.componentName} allready exists at ${this.filePath}.js, choose another name if you want to create a new component`.red);
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
      fs.outputFile(absoluteIndexPath, templates.indexes.default, err => {
        if (err) throw err;
        replace({
          regex: ':className',
          replacement: this.componentName,
          paths: [absoluteIndexPath],
          recursive: false,
          silent: true,
        });
        console.log(`Index file for ${this.componentName} created at ${absoluteIndexPath}`.cyan);
      });
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
    fs.outputFile(path, content, err => {
      if (err) throw err;
      console.log(`Index file for ${this.componentPath} created at ${path}`.cyan);
    });
  }

  updateComponentsIndexFile(path, content) {
    fs.readFile(path, 'utf8', (err, indexContent) => {
      if (err) throw err;

      const indexContentLines = indexContent.split('\n').filter((item, index, arr) => {
        const isLastIndex = index + 1 === arr.length;

        return !isLastIndex && !!item;
      });

      if (!indexContentLines.includes(content)) {
        indexContentLines.push(content);

        const indexContentToSave = indexContentLines.join('\n') + '\n';

        fs.outputFile(path, indexContentToSave, err => {
          if (err) throw err;

          console.log(`Component ${this.componentPath} has been exported`.cyan);
        });
      } else {
        console.log(`Component ${this.componentPath} has been already exported`.red);
      }
    });
  }
}

module.exports = Component;
