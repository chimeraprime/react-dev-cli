function cond(chain) {
  return {
    if(condition, thanF, elseF) {
      return cond(condition ? thanF(chain) : (
        elseF ? elseF(chain) : chain
      ));
    },
    chain(f) {
      return cond(f(chain));
    },
    end() {
      return chain;
    },
  };
}

function capitalize(comp) {
  return comp && comp[0].toUpperCase() + comp.substring(1, comp.length);
}

module.exports = {
  cond,
  capitalize,
};
