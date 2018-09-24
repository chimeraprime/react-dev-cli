const fs = require('fs-extra');
const replace = require('replace');
require('colors');

const templates = require('../templates/component');

const { capitalize } = require('../utils');

class Component {
  constructor(component, options) {
    this.component = capitalize(component);
    this.options = options;
    this.basePath = fs.existsSync('./components')
      ? './components'
      : '';
    this.directoryPath = `${this.basePath}/${this.component}`;
    this.componentPath = `${this.directoryPath}/${this.component}`;
  }

  generateComponent() {
    const template = this.buildTemplate();

    this.writeComponentStructure(template);
  }

  buildTemplate() {
    const imports = [templates.imports.react, templates.imports.propTypes];

    if (this.options.withConnect) {
      imports.push(templates.imports.connect);
    }

    if (this.options.style) {
      imports.push('\n' + templates.imports.stylesheet);
    }

    const body = this.options.functional ? [templates.functional] : [templates.main].join('\n');
    const exported = this.options.withConnect ? [templates.exported.withConnect] : [templates.exported.default];

    return imports.join('\n') + '\n' + body + '\n' + exported;
  }

  writeComponentStructure(template) {
    if (!fs.existsSync(`${this.componentPath}.js`)) {
      this.writeComponentFile(template);
    } else {
      console.log(`Component ${this.component} allready exists at ${this.componentPath}.js, choose another name if you want to create a new component`.red);
    }

    if (this.options.style) {
      this.writeStylesFile();
    }

    this.writeComponentIndexFile();
    this.manageComponentsIndexFile();
  }

  writeComponentFile(template) {
    fs.outputFile(`${this.componentPath}.js`, template, err => {
      if (err) throw err;
      replace({
        regex: ':className',
        replacement: this.component,
        paths: [`${this.componentPath}.js`],
        recursive: false,
        silent: true,
      });
      console.log(`Component ${this.component} created at ${this.componentPath}.js`.cyan);
    });
  }

  writeStylesFile() {
    if (!fs.existsSync(`${this.componentPath}.scss`)) {
      console.log('creating syles');
      fs.outputFileSync(`${this.componentPath}.scss`, '');
      console.log(`Stylesheet ${this.component} created at ${this.componentPath}.scss`.cyan);
    } else {
      console.log(`Stylesheet ${this.component} allready exists at ${this.componentPath}.scss, choose another name if you want to create a new stylesheet`.red);
    }
  }

  writeComponentIndexFile() {
    const indexPath = this.directoryPath + '/index.js';

    if (!fs.existsSync(indexPath)) {
      fs.outputFile(indexPath, templates.indexes.default, err => {
        if (err) throw err;
        replace({
          regex: ':className',
          replacement: this.component,
          paths: [indexPath],
          recursive: false,
          silent: true,
        });
        console.log(`Index file for ${this.component} created at ${indexPath}`.cyan);
      });
    } else {
      console.log(`Index file for ${this.component} has been already added`.red);
    }
  }

  manageComponentsIndexFile() {
    const indexPath = this.basePath + '/index.js';
    const content = templates.indexes.named
      .replace(/:className/gi, capitalize(this.component))
      .replace(/:basePath/gi, capitalize(this.basePath));

    if (fs.existsSync(indexPath)) {
      this.updateComponentsIndexFile(indexPath, content);
    } else {
      this.createComponentsIndexFile(indexPath, content);
    }
  }

  createComponentsIndexFile(path, content) {
    fs.outputFile(path, content, err => {
      if (err) throw err;
      console.log(`Index file for ${this.component} created at ${path}`.cyan);
    });
  }

  updateComponentsIndexFile(path, content) {
    fs.readFile(path, 'utf8', (err, indexContent) => {
      if (err) throw err;

      const indexContentLines = indexContent.split('\n').filter(line => !!line);

      if (!indexContentLines.includes(content)) {
        indexContentLines.push(content);

        const indexContentToSave = indexContentLines.join('\n') + '\n';

        fs.outputFile(path, indexContentToSave, err => {
          if (err) throw err;

          console.log(`Component ${this.component} has been exported`.cyan);
        });
      } else {
        console.log(`Component ${this.component} has been already exported`.red);
      }
    });
  }
}

module.exports = Component;
