const Component = require('../Component');

function generateComponent(component, cmd) {
  const availableOptions = Object.keys(cmd._events).map(option => option.split(':')[1]);
  const options = availableOptions.reduce((acc, curr) => {
    acc[curr] = cmd[curr] || false;

    return acc;
  }, {});

  const componentInstance = new Component(component, options);
  componentInstance.generateComponent();
}

module.exports = generateComponent;
