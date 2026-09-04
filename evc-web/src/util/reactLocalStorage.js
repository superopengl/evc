/**
 * Drop-in replacement for `reactjs-localstorage` (last published 2020), whose getObject assigns
 * to an undeclared `value`:
 *
 *   getObject: function (key, defaultValue = {}, silent = true) {
 *     value = this.get(...)      // implicit global
 *
 * CRA emitted CommonJS, which is sloppy mode, so that quietly created window.value. ES modules
 * are always strict, so under Vite the same line throws "ReferenceError: value is not defined"
 * and took out every page that reads a stored query.
 *
 * Same API and same semantics, minus the bug.
 */
export const reactLocalStorage = {
  set(key, value) {
    localStorage[key] = value;
    return localStorage[key];
  },

  get(key, defaultValue = undefined, silent = true) {
    const value = localStorage[key] || defaultValue;
    if (!silent && !value) {
      throw new Error(`${key} not found in localStorage`);
    }
    return value;
  },

  setObject(key, value) {
    localStorage[key] = JSON.stringify(value);
    return localStorage[key];
  },

  getObject(key, defaultValue = {}, silent = true) {
    const value = this.get(key, JSON.stringify(defaultValue), silent);
    try {
      return JSON.parse(value);
    } catch (e) {
      if (!silent) {
        throw new Error('Error in parsing value');
      }
      return undefined;
    }
  },

  clear() {
    return localStorage.clear();
  },

  remove(key) {
    return localStorage.removeItem(key);
  },
};

export default reactLocalStorage;
