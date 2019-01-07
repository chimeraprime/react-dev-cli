const templates = require('../templates/component');
const templateHooks = require('../templates/hooks');
const templateAssets = require('../templates/assets');

function getTemplate(props = {}) {
  const templateImports = {
    default: [templates.imports.react],
    nextjs: [],
  };
  const { options = {} } = props;
  const strategy = Object.keys(templateImports).includes(props.strategy)
    ? props.strategy
    : 'default';
  const imports = templateImports[strategy];

  if (options.withConnect) {
    imports.push(templates.imports.connect);
  }

  if (options.style) {
    imports.push('\n' + templates.imports.stylesheet);
  }

  let body = options.functional
    ? [templates.functionalComponents[strategy]]
    : [templates.classComponents[strategy]];
  body = manageTemplateHooks(body.join('\n'), options);

  const exported = options.withConnect
    ? [templates.exported.withConnect]
    : [templates.exported.default];

  return imports.join('\n') + '\n' + body + '\n' + exported + '\n';
}

function manageTemplateHooks(body, options = {}) {
  Object.values(templateHooks.component).forEach(hook => {
    switch (hook) {
      case 'getInitialProps':
        body = body.replace(hook, options.withGetInitialProps ? templateAssets[hook] : '');
        break;

      default:
        break;
    }
  });

  return body;
}

module.exports = {
  getTemplate,
  manageTemplateHooks,
};
