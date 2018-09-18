const fs = require('fs-extra');
const replace = require('replace');
require('colors');

const templates = require('../templates/component');

const { capitalize } = require('../utils');

class Component {
  constructor(component, options) {
    this.component = component;
    this.options = options;
  }

  setPath() {
    let path = '';
    if (fs.existsSync('./components')) {
      path = `./components/${capitalize(this.component)}`;
    }
    if (this.options.nofolder) {
      const strArr = path.split('/');
      strArr.splice(strArr.length - 1, 1);
      path = strArr.join('/');
    }

    const componentTree = this.component.split('/');
    const componentName = componentTree[componentTree.length - 1];

    if (path) {
      path = path + '/' + capitalize(componentName);
    } else {
      path = capitalize(componentName);
    }

    this.path = path;
  }

  writeComponent(template) {
    this.setPath();
    this.writeComponentStructure(template, this.component);
  }

  generateComponent() {
    const template = this.buildTemplate();

    this.writeComponent(template);
  }

  buildTemplate() {
    const imports = [templates.imports.react, templates.imports.propTypes];

    if (this.options.style) {
      imports.push('\n' + templates.imports.stylesheet);
    }
    if (this.options.withConnect) {
      imports.push('\n' + templates.imports.connect);
    }

    const body = this.options.functional ? [templates.functional] : [templates.main].join('\n');
    const exported = this.options.withConnect ? [templates.exported.withConnect] : [templates.exported.default];

    return imports.join('\n') + '\n' + body + '\n' + exported;
  }

  writeComponentStructure(template) {
    if (!this.path) throw new Error('You have to set path first!');

    if (this.options.style) {
      this.writeStylesFile();
    }
    if (!this.options.noIndex) {
      this.writeIndexFile();
    }
    if (!fs.existsSync(`${this.path}.js`)) {
      this.writeComponentFile(template);
    } else {
      console.log(`Component ${this.component} allready exists at ${this.path}.js, choose another name if you want to create a new component`.red);
    }
  }

  writeComponentFile(template) {
    fs.outputFile(`${this.path}.js`, template, err => {
      if (err) throw err;
      replace({
        regex: ':className',
        replacement: capitalize(this.component),
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

  writeIndexFile() {
    const strArr = this.path.split('/');
    strArr.splice(strArr.length - 1, 1, 'index.js');
    const indexPath = strArr.join('/');

    fs.outputFile(indexPath, templates.index, err => {
      if (err) throw err;
      replace({
        regex: ':className',
        replacement: capitalize(this.component),
        paths: [indexPath],
        recursive: false,
        silent: true,
      });
      console.log(`Index file for ${this.component} created at ${indexPath}`.cyan);
    });
  }
}

module.exports = Component;
