const  { expect } = require('chai');

const Component = require('./Component');

describe('Component', () => {
  it('must be a class', () => {
    expect(Component.prototype.constructor).to.be.a('function');
  });
});
