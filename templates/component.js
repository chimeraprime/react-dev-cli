const main = `
class :className extends React.PureComponent {
  constructor(props){
    super(props);
  }
  render(){
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

const index = "export { default } from './:className'";

module.exports = {
  main: main,
  imports: imports,
  exported: exported,
  functional: functional,
  index,
};
