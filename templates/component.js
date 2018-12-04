const classComponents = {
  default: `
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
`,
  nextjs: `

class :className extends React.PureComponent {
  state = {

  }

  render() {
    return (
      <>
        

        <style jsx>{\`

        \`}</style>
      </>
    )
  }
}
`,
};

const functional = `
const :className = () => {
  return (
    <div className=":className">
    </div>
  )
}
`;

const imports = {
  react: "import React from 'react';",
  stylesheet: "import './:className.scss';",
  connect: "import { connect } from 'react-redux';",
};

const exported = {
  default: 'export default :className;',
  withConnect: 'export default connect(state => ({\n\n}), {\n\n})(:className);',
};

const indexes = {
  default: "export { default } from './:className'",
  named: "export { default as :className } from ':basePath'",
};

module.exports = {
  classComponents,
  imports,
  exported,
  functional,
  indexes,
};
