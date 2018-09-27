const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const mock = require('mock-fs');
const expect = chai.expect;
chai.use(sinonChai);

const fs = require('fs-extra');

const Component = require('./Component');
const templates = require('../templates/component');

describe('Component', () => {
  const componentName = 'ComponentName';

  afterEach(mock.restore);
  it('should be a class', () => {
    expect(Component.prototype.constructor).to.be.a('function');
  });


  it('should have set base path to components if directory exists', () => {
    mock({
      'components': {},
    });
    const component = new Component();

    expect(component.basePath).to.equal('./components');
  });

  it('should have set base path to root if components directory doesn\'t exist', () => {
    const component = new Component();

    expect(component.basePath).to.equal('');
  });

  describe('[buildTemplate]', () => {
    describe('should generate proper template based on options', () => {
      it('no options', () => {
        const component = new Component('ComponentName');
        const template = component.buildTemplate();

        const expectedImports = [templates.imports.react];
        const expectedBody = [templates.main].join('\n');
        const expectedExport = [templates.exported.default];
        const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport;

        expect(template).to.equal(expectedTemplate);
      });

      it('withConnect', () => {
        const component = new Component('ComponentName', { withConnect: true });
        const template = component.buildTemplate();

        const expectedImports = [templates.imports.react, templates.imports.connect];
        const expectedBody = [templates.main].join('\n');
        const expectedExport = [templates.exported.withConnect];
        const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport;

        expect(template).to.equal(expectedTemplate);
      });

      it('style', () => {
        const component = new Component('ComponentName', { style: true });
        const template = component.buildTemplate();

        const expectedImports = [templates.imports.react, '\n' + templates.imports.stylesheet];
        const expectedBody = [templates.main].join('\n');
        const expectedExport = [templates.exported.default];
        const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport;

        expect(template).to.equal(expectedTemplate);
      });

      it('withConnect and style', () => {
        const component = new Component(componentName, { withConnect: true, style: true });
        const template = component.buildTemplate();

        const expectedImports = [
          templates.imports.react,
          templates.imports.connect,
          '\n' + templates.imports.stylesheet,
        ];
        const expectedBody = [templates.main].join('\n');
        const expectedExport = [templates.exported.withConnect];
        const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport;

        expect(template).to.equal(expectedTemplate);
      });
    });
  });

  describe('[writeComponentStructure]', () => {
    let component;
    let writeComponentFileStub;
    let writeComponentIndexFileStub;
    let manageComponentsIndexFileStub;

    beforeEach(() => {
      component = new Component(componentName);
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
      it('with component file if doesn\'t exist', () => {
        const template = 'sample template';

        component.writeComponentStructure(template);

        expect(writeComponentFileStub).to.have.been.calledWith(template);
        expect(writeComponentIndexFileStub).to.have.been.called;
        expect(manageComponentsIndexFileStub).to.have.been.called;
      });

      it('without component file if already exists', () => {
        mock({
          [`/${componentName}/${componentName}.js`]: mock.file({ content: 'sample file content' }),
        });

        component.writeComponentStructure('sample template');

        expect(writeComponentFileStub).to.have.not.been.called;
      });

      it('with styles file', () => {
        component.options.style = true;
        const writeStylesFileStub = sinon.stub(component, 'writeStylesFile');

        component.writeComponentStructure('sample template');

        expect(writeStylesFileStub).to.have.been.called;
      });
    });
  });

  describe('[writeStylesFile]', () => {
    const componentPath = `/${componentName}/${componentName}.scss`;
    let outputFileSyncStub;
    let component;

    beforeEach(() => {
      outputFileSyncStub = sinon.stub(fs, 'outputFileSync');
      component = new Component(componentName, { style: true });
    });
    afterEach(() => outputFileSyncStub.restore());

    it('should create empty scss file if doesn\'t exist', () => {
      component.writeStylesFile();

      expect(fs.outputFileSync).to.have.been.calledWith(componentPath, '');
    });

    it('should not create scss file if already exists', () => {
      mock({
        [componentPath]: mock.file({ content: 'sample file content' }),
      });

      component.writeStylesFile();

      expect(fs.outputFileSync).to.have.not.been.called;
    });
  });

  describe('[writeComponentIndexFile]', () => {
    const indexPath = `/${componentName}/index.js`;
    let outputFileStub;
    let component;

    beforeEach(() => {
      outputFileStub = sinon.stub(fs, 'outputFile');
      component = new Component(componentName);
    });
    afterEach(() => outputFileStub.restore());

    it('should create index file for a component, if doesn\'t exist', () => {
      component.writeComponentIndexFile();

      expect(outputFileStub).to.have.been.calledWith(indexPath, templates.indexes.default);
    });

    it('should not create index file for component if already exists', () => {
      mock({
        [indexPath]: mock.file({ content: 'sample file content' }),
      });

      component.writeComponentIndexFile();

      expect(outputFileStub).to.have.not.been.called;
    });
  });

  describe('[manageComponentsIndexFile]', () => {
    const indexPath = 'components/index.js';
    let component;
    let updateComponentsIndexFileStub;
    let createComponentsIndexFileStub;

    beforeEach(() => {
      mock({
        components: {},
      });
      component = new Component(componentName);
      updateComponentsIndexFileStub = sinon.stub(component, 'updateComponentsIndexFile');
      createComponentsIndexFileStub = sinon.stub(component, 'createComponentsIndexFile');
    });
    afterEach(() => {
      mock.restore();
    });

    it('should update components index file if already exists', () => {
      mock({
        components: {
          ['index.js']: {},
        },
      });

      component.manageComponentsIndexFile();

      expect(updateComponentsIndexFileStub).to.have.been.calledWithMatch(indexPath);
      expect(createComponentsIndexFileStub).to.have.not.been.called;
    });

    it('should create components index file if doesn\'t exist', () => {
      component.manageComponentsIndexFile();

      expect(createComponentsIndexFileStub).to.have.been.calledWithMatch(indexPath);
      expect(updateComponentsIndexFileStub).to.have.not.been.called;
    });
  });

  describe('[updateComponentsIndexFile]', () => {
    const path = 'components/index.js';
    const indexBaseContent = "export { default as AnotherComponent } from './AnotherComponent'";
    let outputFileStub;
    let readFileStub;
    let component;

    beforeEach(() => {
      component = new Component(componentName);
      outputFileStub = sinon.stub(fs, 'outputFile');
      readFileStub = sinon.stub(fs, 'readFile')
        .callsFake((path, format, cb) => cb('', indexBaseContent + '\n'));
    });
    afterEach(() => {
      outputFileStub.restore();
      readFileStub.restore();
    });

    it('should update file if content is not duplicated', () => {
      const content = `export { default as ${componentName} } from './${componentName}'`;
      const expectedContent = `${indexBaseContent}\n${content}\n`;

      component.updateComponentsIndexFile(path, content);
      expect(outputFileStub).to.have.been.calledWithMatch(path, expectedContent);
    });

    it('should not update file if content is duplicated', () => {
      component.updateComponentsIndexFile(path, indexBaseContent);
      expect(outputFileStub).to.have.not.been.called;
    });
  });
});
