function capitalize(comp) {
  return comp && comp[0].toUpperCase() + comp.substring(1, comp.length);
}

module.exports = {
  capitalize,
};
