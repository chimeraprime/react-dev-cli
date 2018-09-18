const main = `
class :className extends React.PureComponent {
  state = {

  }

  render() {
    return (
      <div className=":className">

      </div>
    )
  }
}

:className.propTypes = {
}
`;

const functional = `
const :className = () => {
  return (
    <div className=":className">
    </div>
  )
}

:className.propTypes = {
}
`;

const imports = {
  react: "import React from 'react';",
  propTypes: "import PropTypes from 'prop-types';",
  stylesheet: "import './:className.scss';",
  connect: "import { connect } from 'react-redux';",
};

const exported = {
  default: 'export default :className;',
  withConnect: 'export default connect(state => ({\n\n}), {\n\n})(:className);',
};

const indexes = {
  default: "export { default } from './:className'",
  named: "export { default as :className } from ':basePath/:className'",
};

module.exports = {
  main,
  imports,
  exported,
  functional,
  indexes,
};
