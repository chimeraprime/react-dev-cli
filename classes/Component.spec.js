const { expect } = require('chai');
const mock = require('mock-fs');

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
});
