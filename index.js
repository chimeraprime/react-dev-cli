#!/usr/bin/env node

require('colors');
const program = require('commander');
const pjson = require('./package.json');
const { getConfig } = require('./config');
const config = getConfig();

const generateComponent = require('./actions/generateComponent');
const initProject = require('./actions/initProject');
const { cond } = require('./utils/index');
const isNextJS = config.framework === 'nextjs';

cond(program)
  .chain(program => program
    .version(pjson.version, '-v, --version')
    .command('component <component>')
    .option('-s, --style', 'With stylesheet')
    .option('-f, --functional', 'Create functional component')
    .option('-c, --withConnect', 'Wrap with redux connect')
    .option('--subfolder [subfolder]', 'Folder when you want to store your component', 'components')
  )
  .if(isNextJS, program => program.option('--withGetInitialProps', 'Attach getInitialProps static method'))
  .chain(program => program.action(generateComponent))
  .end();

if (isNextJS) {
  program
    .command('page <page>')
    .option('-f, --functional', 'Create functional component')
    .action((page, cmd) => generateComponent(page, cmd, {
      withGetInitialProps: true,
      subfolder: 'pages',
    }));
}

program
  .command('init')
  .action(initProject);

program
  .command('config')
  .action(() => {
    console.log(config);
  });

program.parse(process.argv);
