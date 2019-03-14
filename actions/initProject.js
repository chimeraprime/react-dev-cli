const Linter = require('../classes/Linter');
const config = require('../config');

function initProject() {
  config.createConfigFile();

  const linter = new Linter();
  linter.setup();
}

module.exports = initProject;
