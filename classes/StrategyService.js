const templates = require('../templates/component');

const getTemplate = (props = {}) => {
  const templateImports = {
    default: [templates.imports.react],
    nextjs: [],
  };
  const { strategy = 'default', options = {} } = props;
  const imports = templateImports[strategy];

  if (options.withConnect) {
    imports.push(templates.imports.connect);
  }

  if (options.style) {
    imports.push('\n' + templates.imports.stylesheet);
  }

  const body = options.functional
    ? [templates.functional]
    : [templates.classComponents[strategy]].join('\n');
  const exported = options.withConnect
    ? [templates.exported.withConnect]
    : [templates.exported.default];

  return imports.join('\n') + '\n' + body + '\n' + exported;
};

module.exports = {
  getTemplate,
};
