const program = require('commander');
const pjson = require('./package.json');

const generateComponent = require('./actions/generateComponent');

program
  .version(pjson.version, '-v, --version')
  .command('gc <component>')
  .option('-n, --nofolder', 'Do not wrap component in folder')
  .option('-s, --style', 'With stylesheet')
  .option('-f, --functional', 'Create functional component')
  .option('-c, --withConnect', 'Wrap with redux connect')
  .action(generateComponent);

program.parse(process.argv);
