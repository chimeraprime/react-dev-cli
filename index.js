#!/usr/bin/env node

require('colors');
const program = require('commander');
const pjson = require('./package.json');

const generateComponent = require('./actions/generateComponent');

program
  .version(pjson.version, '-v, --version')

  .command('component <component>')
  .option('-s, --style', 'With stylesheet')
  .option('-f, --functional', 'Create functional component')
  .option('-c, --withConnect', 'Wrap with redux connect')
  .option('--subfolder [subfolder]', 'Folder when you want to store your component', 'components')
  .action(generateComponent);

program
  .command('config')
  .action(() => {
    const { getConfig } = require('./config');

    const config = getConfig();
    console.log(config);
  });

program.parse(process.argv);
