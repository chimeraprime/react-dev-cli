const chai = require('chai');
const expect = chai.expect;

const { getTemplate, manageTemplateHooks } = require('./StrategyService');
const templates = require('../templates/component');

describe('StrategyService', () => {
  describe('should generate proper template based on options', () => {
    it('no options', () => {
      const template = getTemplate();

      const expectedImports = [templates.imports.react];
      const expectedBody = [templates.classComponents.default].join('\n');
      const expectedExport = [templates.exported.default];
      const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });

    it('withConnect', () => {
      const options = { withConnect: true };
      const template = getTemplate({ options });

      const expectedImports = [templates.imports.react, templates.imports.connect];
      const expectedBody = [templates.classComponents.default].join('\n');
      const expectedExport = [templates.exported.withConnect];
      const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });

    it('style', () => {
      const options = { style: true };
      const template = getTemplate({ options });

      const expectedImports = [templates.imports.react, '\n' + templates.imports.stylesheet];
      const expectedBody = [templates.classComponents.default].join('\n');
      const expectedExport = [templates.exported.default];
      const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });

    it('withConnect and style', () => {
      const options = { withConnect: true, style: true };
      const template = getTemplate({ options });

      const expectedImports = [
        templates.imports.react,
        templates.imports.connect,
        '\n' + templates.imports.stylesheet,
      ];
      const expectedBody = [templates.classComponents.default].join('\n');
      const expectedExport = [templates.exported.withConnect];
      const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });
  });

  describe('should generate template based on strategy', () => {
    it('nextjs class component', () => {
      const template = getTemplate({ strategy: 'nextjs' });

      const expectedBody = [templates.classComponents.nextjs].join('\n');
      const expectedExport = [templates.exported.default];
      const expectedTemplate = '\n' + manageTemplateHooks(expectedBody) + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });

    it('nextjs class component with getInitialProps method', () => {
      const options = {
        withGetInitialProps: true,
      };
      const template = getTemplate({ strategy: 'nextjs', options });

      const expectedBody = [templates.classComponents.nextjs].join('\n');
      const expectedExport = [templates.exported.default];
      const expectedTemplate = '\n' + manageTemplateHooks(expectedBody, options) + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });

    it('nextjs functional component', () => {
      const template = getTemplate({ strategy: 'nextjs', options: { functional: true } });

      const expectedBody = [templates.functionalComponents.nextjs].join('\n');
      const expectedExport = [templates.exported.default];
      const expectedTemplate = '\n' + expectedBody + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });

    it('default if selected strategy is not supported', () => {
      const template = getTemplate({ strategy: 'not supported' });

      const expectedImports = [templates.imports.react];
      const expectedBody = [templates.classComponents.default].join('\n');
      const expectedExport = [templates.exported.default];
      const expectedTemplate = expectedImports.join('\n') + '\n' + expectedBody + '\n' + expectedExport + '\n';

      expect(template).to.equal(expectedTemplate);
    });
  });
});
