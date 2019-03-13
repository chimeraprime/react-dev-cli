const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const fs = require('fs-extra');

const Linter = require('./Linter');

describe('Liner', () => {
  it('should be a class', () => {
    expect(Linter.prototype.constructor).to.be.a('function');
  });

  describe('[getExtendedConfig]', () => {
    describe('if no extends defined', () => {
      it('should return config extended only with chimera config', () => {
        const config = {};
        const expectedConfig = {
          extends: Linter.CHIMERA_EXTEND,
        };
        const extendedConfig = Linter.getExtendedConfig(config);

        expect(extendedConfig).to.deep.equal(expectedConfig);
      });
    });

    describe('if single extends defined', () => {
      it('should return config extended with chimera config and already defined config', () => {
        const config = {
          extends: 'testConfig',
        };
        const expectedConfig = {
          extends: [
            config.extends,
            Linter.CHIMERA_EXTEND,
          ],
        };
        const extendedConfig = Linter.getExtendedConfig(config);

        expect(extendedConfig).to.deep.equal(expectedConfig);
      });

      it('should return config extended with chimera config with no duplications', () => {
        const config = {
          extends: Linter.CHIMERA_EXTEND,
        };
        const extendedConfig = Linter.getExtendedConfig(config);

        expect(extendedConfig).to.deep.equal(config);
      });
    });

    describe('if multiple extends defined', () => {
      it('should return config extended with chimera config and rest of already defined configs', () => {
        const config = {
          extends: [
            'testConfig1',
            'testConfig2',
          ],
        };
        const expectedConfig = {
          extends: [
            ...config.extends,
            Linter.CHIMERA_EXTEND,
          ],
        };
        const extendedConfig = Linter.getExtendedConfig(config);

        expect(extendedConfig).to.deep.equal(expectedConfig);
      });

      it('should return config extended with chimera config with no duplications', () => {
        const config = {
          extends: [
            'testConfig1',
            Linter.CHIMERA_EXTEND,
          ],
        };
        const extendedConfig = Linter.getExtendedConfig(config);

        expect(extendedConfig).to.deep.equal(config);
      });
    });
  });

  describe('[createChimeraEslintConfig]', () => {
    const linter = new Linter();

    let outputFileSyncStub;
    let readFileSyncStub;

    beforeEach(() => {
      outputFileSyncStub = sinon.stub(fs, 'outputFileSync');
      readFileSyncStub = sinon.stub(fs, 'readFileSync');
    });
    afterEach(() => {
      outputFileSyncStub.restore();
      readFileSyncStub.restore();
    });

    it('should write extended config if already exists', () => {
      const config = {
        testValue: 'testValue',
        rules: {
          testRule: 'testRule',
        },
      };
      const expectedConfig = {
        ...config,
        extends: Linter.CHIMERA_EXTEND,
      };
      readFileSyncStub.callsFake(() => JSON.stringify(config));

      linter.createChimeraEslintConfig();

      expect(outputFileSyncStub).to.have.been.calledWith(
        Linter.CONFIG_PATH,
        JSON.stringify(expectedConfig, null, 2)
      );
    });

    it('should write config with chimera config extends', () => {
      readFileSyncStub.callsFake(() => {
        const err = new Error('test error message');
        err.code = 'ENOENT';

        throw err;
      });
      const expectedConfig = {
        extends: Linter.CHIMERA_EXTEND,
      };

      linter.createChimeraEslintConfig();

      expect(outputFileSyncStub).to.have.been.calledWith(
        Linter.CONFIG_PATH,
        JSON.stringify(expectedConfig, null, 2)
      );
    });
  });
});
