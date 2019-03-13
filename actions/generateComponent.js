const Component = require('../classes/Component');
const Linter = require('../classes/Linter');

function generateComponent(component, cmd, additionalOptions) {
  const { _events = {} } = cmd;
  const availableOptions = Object.keys(_events).map(option => option.split(':')[1]);
  const options = availableOptions.reduce((acc, curr) => {
    acc[curr] = cmd[curr] || false;

    return acc;
  }, {});

  const componentInstance = new Component({
    component,
    options: {
      ...options,
      ...additionalOptions,
    },
  });
  const linter = new Linter();
  componentInstance.generateComponent();
  linter.fix(componentInstance.folderPath);
}

module.exports = generateComponent;
