const Component = require('../classes/Component');

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
  componentInstance.generateComponent();
}

module.exports = generateComponent;
