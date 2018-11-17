const LocalStorage = require('node-localstorage').LocalStorage;
const ser = require('node-serialize');

class Cache {
  constructor(name) {
    this.store = new LocalStorage(`./cache/${name}`);
  }

  getItem(key) {
    let obj = this.store.getItem(key);
    if (obj) {
      return ser.unserialize(obj);
    }
  }

  setItem(key, value) {
    if (value) {
      return this.store.setItem(key, ser.serialize(value));
    }
  }

  clear() {
    return this.store.clear();
  }
}

module.exports = Cache;