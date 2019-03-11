const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const mock = require('mock-fs');
const expect = chai.expect;
chai.use(sinonChai);

const fs = require('fs-extra');

const Component = require('./Component');
const templates = require('../templates/component');

const { capitalize } = require('../utils');
const { defaultConfig } = require('../config');

const getConfigStub = sinon.stub(Component, 'getConfig').callsFake(() => defaultConfig);

describe('Component', () => {
  const componentName = 'list';
  const subComponentName = 'listItem';

  afterEach(mock.restore);
  it('should be a class', () => {
    expect(Component.prototype.constructor).to.be.a('function');
  });

  describe('should have set proper properties', () => {
    describe('witout config', () => {
      describe('componentsPath', () => {
        it('when components directory exists', () => {
          mock({
            'components': {},
          });
          const component = new Component();

          expect(component.componentsPath).to.equal('components');
        });

        it('when components directory doesn\'t exist', () => {
          const component = new Component();

          expect(component.componentsPath).to.equal('.');
        });

        it('when selected directory exists', () => {
          mock({
            'pages': {},
          });
          const component = new Component({ options: { subfolder: 'pages' } });

          expect(component.componentsPath).to.equal('pages');
        });

        it('when selected directory doesn\'t exist', () => {
          const component = new Component({ options: { subfolder: 'pages' } });

          expect(component.componentsPath).to.equal('.');
        });
      });

      describe('componentName', () => {
        it('when component is on the first level', () => {
          const component = new Component({ component: componentName });

          expect(component.componentName).to.equal(capitalize(componentName));
        });

        it('when component is on the deeper level', () => {
          const name = 'Header';
          const component = new Component({ component: `${componentName}/${subComponentName}/${name}` });

          expect(component.componentName).to.equal(name);
        });
      });

      describe('folderPath', () => {
        it('when components directory exists', () => {
          const name = 'Header';
          const directories = [componentName, subComponentName, name];
          const component = new Component({ component: directories.join('/') });
          const expectedPath = directories.map(item => capitalize(item)).join('/');

          expect(component.folderPath).to.equal(expectedPath);
        });

        it('when components directory doesn\'t exist', () => {
          mock({
            'components': {},
          });
          const name = 'ListItem';
          const directories = [componentName, subComponentName, name];
          const componentPath = directories.map(item => capitalize(item)).join('/');
          const expectedPath = `components/${componentPath}`;
          const component = new Component({ component: componentPath });

          expect(component.folderPath).to.equal(expectedPath);
        });
      });
    });
  });

  describe('[writeComponentStructure]', () => {
    let component;
    let writeComponentFileStub;
    let writeComponentIndexFileStub;
    let manageComponentsIndexFileStub;

    beforeEach(() => {
      component = new Component({ component: componentName });
      writeComponentFileStub = sinon.stub(component, 'writeComponentFile');
      writeComponentIndexFileStub = sinon.stub(component, 'writeComponentIndexFile');
      manageComponentsIndexFileStub = sinon.stub(component, 'manageComponentsIndexFile');
    });
    afterEach(() => {
      writeComponentFileStub.restore();
      writeComponentIndexFileStub.restore();
      manageComponentsIndexFileStub.restore();
    });

    describe('should write component structure', () => {
      it('without styles file', () => {
        const template = 'sample template';

        component.writeComponentStructure(template);

        expect(writeComponentFileStub).to.have.been.calledWith(template);
        expect(writeComponentIndexFileStub).to.have.been.called;
        expect(manageComponentsIndexFileStub).to.have.been.called;
      });

      it('with styles file', () => {
        component.options.style = true;
        const writeStylesFileStub = sinon.stub(component, 'writeStylesFile');

        component.writeComponentStructure('sample template');

        expect(writeStylesFileStub).to.have.been.called;
      });
    });
  });

  describe('[writeComponentFile]', () => {
    const expectedPath = `${process.cwd()}/${capitalize(componentName)}/${capitalize(componentName)}.js`;
    let outputFileStub;
    let existsSyncStub;
    let component;

    beforeEach(() => {
      outputFileStub = sinon.stub(fs, 'outputFile');
      existsSyncStub = sinon.stub(fs, 'existsSync');
      component = new Component({ component: componentName });
    });
    afterEach(() => {
      outputFileStub.restore();
      existsSyncStub.restore();
    });

    it('should manage with proper path', () => {
      component.writeComponentFile();

      expect(outputFileStub).to.have.been.calledWith(expectedPath);
    });

    it('should write file when doesn\'t exist', () => {
      existsSyncStub.callsFake(() => false);
      component.writeComponentFile();

      expect(outputFileStub).to.have.been.called;
    });

    it('should not write file when already exists', () => {
      existsSyncStub.callsFake(() => true);
      component.writeComponentFile();

      expect(outputFileStub).to.have.not.been.called;
    });
  });

  describe('[writeStylesFile]', () => {
    const componentStylesPath = `${process.cwd()}/${capitalize(componentName)}/${capitalize(componentName)}.css`;
    let outputFileSyncStub;
    let component;

    beforeEach(() => {
      outputFileSyncStub = sinon.stub(fs, 'outputFileSync');
      component = new Component({ component: componentName, options: { style: true } });
    });
    afterEach(() => outputFileSyncStub.restore());

    describe('should create empty styles file when doesn\'t exist', () => {
      it('with .css extension when not specified in project config', () => {
        component.writeStylesFile();

        expect(fs.outputFileSync).to.have.been.calledWith(componentStylesPath, '');
      });

      it('with extension specified in project config', () => {
        const extension = 'sass';
        getConfigStub.callsFake(() => ({ stylesType: extension }));
        const expectedComponentStylesPath = `${process.cwd()}/${capitalize(componentName)}/${capitalize(componentName)}.${extension}`;

        component.writeStylesFile();

        expect(fs.outputFileSync).to.have.been.calledWith(expectedComponentStylesPath, '');
        getConfigStub.callsFake(() => defaultConfig);
      });
    });

    it('should not create styles file when already exists', () => {
      mock({
        [componentStylesPath]: mock.file({ content: 'sample file content' }),
      });

      component.writeStylesFile();

      expect(fs.outputFileSync).to.have.not.been.called;
    });
  });

  describe('[writeComponentIndexFile]', () => {
    const indexPath = `${process.cwd()}/${capitalize(componentName)}/index.js`;
    let outputFileStub;
    let component;

    beforeEach(() => {
      outputFileStub = sinon.stub(fs, 'outputFile');
      component = new Component({ component: componentName });
    });
    afterEach(() => outputFileStub.restore());

    it('should create index file for a component, when doesn\'t exist', () => {
      component.writeComponentIndexFile();

      expect(outputFileStub).to.have.been.calledWith(indexPath, templates.indexes.default);
    });

    it('should not create index file for component when already exists', () => {
      mock({
        [indexPath]: mock.file({ content: 'sample file content' }),
      });

      component.writeComponentIndexFile();

      expect(outputFileStub).to.have.not.been.called;
    });
  });

  describe('[manageComponentsIndexFile]', () => {
    const indexAbsolutePath = `${process.cwd()}/components/index.js`;
    let component;
    let updateComponentsIndexFileStub;
    let createComponentsIndexFileStub;
    let existsSyncStub;

    beforeEach(() => {
      mock({
        components: {},
      });
      component = new Component({ component: componentName });
      updateComponentsIndexFileStub = sinon.stub(component, 'updateComponentsIndexFile');
      createComponentsIndexFileStub = sinon.stub(component, 'createComponentsIndexFile');
      existsSyncStub = sinon.stub(fs, 'existsSync');
    });
    afterEach(() => {
      mock.restore();
      existsSyncStub.restore();
    });

    it('should update components index file when already exists', () => {
      existsSyncStub.callsFake(() => true);

      component.manageComponentsIndexFile();

      expect(updateComponentsIndexFileStub).to.have.been.calledWithMatch(indexAbsolutePath);
      expect(createComponentsIndexFileStub).to.have.not.been.called;
    });

    it('should create components index file when doesn\'t exist', () => {
      existsSyncStub.callsFake(() => false);

      component.manageComponentsIndexFile();

      expect(createComponentsIndexFileStub).to.have.been.calledWithMatch(indexAbsolutePath);
      expect(updateComponentsIndexFileStub).to.have.not.been.called;
    });

    describe('should generate proper content for index file', () => {
      it('when component is on the first level', () => {
        existsSyncStub.callsFake(() => true);
        const expectedContent = templates.indexes.named
          .replace(/:className/gi, capitalize(componentName))
          .replace(/:basePath/gi, `./${capitalize(componentName)}`);

        component.manageComponentsIndexFile();

        expect(updateComponentsIndexFileStub).to.have.been
          .calledWith(indexAbsolutePath, expectedContent);
      });

      it('when component is on the deeper level', () => {
        existsSyncStub.callsFake(() => true);
        const name = 'header';
        const directories = [componentName, subComponentName, name];
        component = new Component({ component: directories.join('/') });
        updateComponentsIndexFileStub = sinon.stub(component, 'updateComponentsIndexFile');
        createComponentsIndexFileStub = sinon.stub(component, 'createComponentsIndexFile');

        const expectedContent = templates.indexes.named
          .replace(/:className/gi, capitalize(name))
          .replace(/:basePath/gi, `./${directories.map(item => capitalize(item)).join('/')}`);
        component.manageComponentsIndexFile();

        expect(updateComponentsIndexFileStub).to.have.been
          .calledWith(indexAbsolutePath, expectedContent);
      });
    });
  });

  describe('[updateComponentsIndexFile]', () => {
    const path = 'components/index.js';
    const indexBaseContent = "export { default as AnotherComponent } from './AnotherComponent'";
    let outputFileStub;
    let readFileStub;
    let component;

    beforeEach(() => {
      component = new Component({ component: componentName });
      outputFileStub = sinon.stub(fs, 'outputFile');
      readFileStub = sinon.stub(fs, 'readFile')
        .callsFake((path, format, cb) => cb('', indexBaseContent + '\n'));
    });
    afterEach(() => {
      outputFileStub.restore();
      readFileStub.restore();
    });

    it('should update file when content is not duplicated', () => {
      const content = `export { default as ${componentName} } from './${componentName}'`;
      const expectedContent = `${indexBaseContent}\n${content}\n`;

      component.updateComponentsIndexFile(path, content);
      expect(outputFileStub).to.have.been.calledWithMatch(path, expectedContent);
    });

    it('should not update file when content is duplicated', () => {
      component.updateComponentsIndexFile(path, indexBaseContent);
      expect(outputFileStub).to.have.not.been.called;
    });
  });
});
