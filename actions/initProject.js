const Linter = require('../classes/Linter');
const config = require('../config');

function initProject() {
  config.createConfigFile();

  const linter = new Linter();
  linter.setupChimeraEslint();
}

module.exports = initProject;
