const templates = require('../templates/component');

const getTemplate = (props = {}) => {
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

  const body = options.functional
    ? [templates.functionalComponents[strategy]]
    : [templates.classComponents[strategy]].join('\n');
  const exported = options.withConnect
    ? [templates.exported.withConnect]
    : [templates.exported.default];

  return imports.join('\n') + '\n' + body + '\n' + exported + '\n';
};

module.exports = {
  getTemplate,
};
