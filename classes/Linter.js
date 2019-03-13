const { exec } = require('child_process');
const fs = require('fs-extra');

class Linter {
  constructor() {
    this.eslintPath = `${process.cwd()}/node_modules/.bin/eslint`;
    this.eslintInstalled = fs.existsSync(this.eslintPath);

    if (!this.eslintInstalled) {
      throw new Error('Install eslint in the project!');
    }
  }

  fix(relPath) {
    exec(`${this.eslintPath} ${process.cwd()}/${relPath} --fix --color`, (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
  }
}

module.exports = Linter;
