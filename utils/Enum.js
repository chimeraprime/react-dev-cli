class Enum {
  constructor(...array) {
    array.forEach(item => {
      const upperCasedItem = item.toUpperCase();
      this[item] = upperCasedItem;
    });

    Object.freeze(this);
  }
}

module.exports = Enum;
