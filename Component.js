const fs = require('fs-extra');
const replace = require('replace');
require('colors');

const templates = require('./templates/component');

const { capitalize } = require('./utils');

class Component {
  constructor(component, options) {
    this.component = capitalize(component);
    this.options = options;
    this.basePath = fs.existsSync('./components')
      ? './components'
      : '';
    this.path = `${this.basePath}/${this.component}/${this.component}`;
  }

  getDirectoryPath() {
    const strArr = this.path.split('/');
    strArr.splice(strArr.length - 1, 1);
    const indexPath = strArr.join('/');

    return indexPath;
  }

  writeComponent(template) {
    this.writeComponentStructure(template, this.component);
  }

  generateComponent() {
    const template = this.buildTemplate();

    this.writeComponent(template);
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
    if (!this.path) throw new Error('You have to set path first!');

    if (!fs.existsSync(`${this.path}.js`)) {
      this.writeComponentFile(template);
    } else {
      console.log(`Component ${this.component} allready exists at ${this.path}.js, choose another name if you want to create a new component`.red);
    }

    if (this.options.style) {
      this.writeStylesFile();
    }

    this.writeComponentIndexFile();
    this.updateComponentsIndexFile();
  }

  writeComponentFile(template) {
    fs.outputFile(`${this.path}.js`, template, err => {
      if (err) throw err;
      replace({
        regex: ':className',
        replacement: this.component,
        paths: [`${this.path}.js`],
        recursive: false,
        silent: true,
      });
      console.log(`Component ${this.component} created at ${this.path}.js`.cyan);
    });
  }

  writeStylesFile() {
    if (!fs.existsSync(`${this.path}.scss`)) {
      console.log('creating syles');
      fs.outputFileSync(`${this.path}.scss`, '');
      console.log(`Stylesheet ${this.component} created at ${this.path}.scss`.cyan);
    } else {
      console.log(`Stylesheet ${this.component} allready exists at ${this.path}.scss, choose another name if you want to create a new stylesheet`.red);
    }
  }

  writeComponentIndexFile() {
    const indexPath = this.getDirectoryPath() + '/index.js';

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

  updateComponentsIndexFile() {
    const indexPath = this.basePath + '/index.js';
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const indexContentLines = indexContent.split('\n').filter(line => !!line);
    const exportLine = templates.indexes.named
      .replace(/:className/gi, capitalize(this.component))
      .replace(/:basePath/gi, capitalize(this.basePath));

    if (!indexContentLines.includes(exportLine)) {
      indexContentLines.push(exportLine);

      const indexContentToSave = indexContentLines.join('\n') + '\n';

      fs.outputFile(indexPath, indexContentToSave, err => {
        if (err) throw err;

        console.log(`Component ${this.component} has been exported`.cyan);
      });
    } else {
      console.log(`Component ${this.component} has been already exported`.red);
    }
  }
}

module.exports = Component;
