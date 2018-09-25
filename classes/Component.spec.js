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
  afterEach(mock.restore);
  it('must be a class', () => {
    expect(Component.prototype.constructor).to.be.a('function');
  });


  it('must have set base path to components if exists', () => {
    mock({
      'components': {},
    });
    const component = new Component();

    expect(component.basePath).to.equal('./components');
  });

  it('must have set base path to root if components directory doesn\'t exist', () => {
    const component = new Component();

    expect(component.basePath).to.equal('');
  });

  describe('must generate proper template based on options', () => {
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
      const component = new Component('ComponentName', { withConnect: true, style: true });
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

  describe('must write component structure', () => {
    it('with component file if doesn\'t exist', () => {
      const component = new Component('ComponentName');
      const template = 'sample template';

      const writeComponentFileStub = sinon.stub(component, 'writeComponentFile');
      const writeComponentIndexFileStub = sinon.stub(component, 'writeComponentIndexFile');
      const manageComponentsIndexFileStub = sinon.stub(component, 'manageComponentsIndexFile');

      component.writeComponentStructure(template);

      expect(writeComponentFileStub).to.have.been.calledWith(template);
      expect(writeComponentIndexFileStub).to.have.been.called;
      expect(manageComponentsIndexFileStub).to.have.been.called;
    });

    it('without component file if doesn\'t exist', () => {
      const name = 'ComponentName';
      mock({
        [`/${name}/${name}.js`]: Buffer.from([8, 6, 7, 5, 3, 0, 9]),
      });
      const component = new Component(name);

      const writeComponentFileStub = sinon.stub(component, 'writeComponentFile');
      const writeComponentIndexFileStub = sinon.stub(component, 'writeComponentIndexFile');
      const manageComponentsIndexFileStub = sinon.stub(component, 'manageComponentsIndexFile');

      component.writeComponentStructure('sample template');

      expect(writeComponentFileStub).to.have.not.been.called;
      expect(writeComponentIndexFileStub).to.have.been.called;
      expect(manageComponentsIndexFileStub).to.have.been.called;
    });

    it('with styles file', () => {
      const component = new Component('ComponentName', { style: true });

      sinon.stub(component, 'writeComponentFile');
      sinon.stub(component, 'writeComponentIndexFile');
      sinon.stub(component, 'manageComponentsIndexFile');
      const writeStylesFileStub = sinon.stub(component, 'writeStylesFile');

      component.writeComponentStructure('sample template');

      expect(writeStylesFileStub).to.have.been.called;
    });
  });

  describe('[writeStylesFile]', () => {
    const name = 'ComponentName';
    const componentPath = `/${name}/${name}.scss`;

    it('must create empty scss file if doesn\'t exist', () => {
      const component = new Component(name, { style: true });
      const outputFileSyncStub = sinon.stub(fs, 'outputFileSync');

      component.writeStylesFile();

      expect(fs.outputFileSync).to.have.been.calledWith(componentPath, '');
      outputFileSyncStub.restore();
    });

    it('must not create scss file if already exists', () => {
      const component = new Component(name, { style: true });
      const outputFileSyncStub = sinon.stub(fs, 'outputFileSync');

      mock({
        [componentPath]: Buffer.from([8, 6, 7, 5, 3, 0, 9]),
      });

      component.writeStylesFile();

      expect(fs.outputFileSync).to.have.not.been.called;
      outputFileSyncStub.restore();
    });
  });
});
