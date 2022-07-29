class HookMap {
  #map = new Map();
  #factory;
  constructor(hookFactory) {
    this.#factory = hookFactory;
  }
  for(key) {
    const hook = this.get(key);
    if (hook) return hook;
    const newHook = this.#factory();
    this.#map.set(key, newHook);
    return newHook;
  }
  get(key) {
    return this.#map.get(key);
  }
  tapAsync(key, options, fn){
    return this.for(key).tapAsync(options, fn)
  }
  tapPromise(key, options, fn){
    return this.for(key).tapPromise(options, fn)
  }
}
module.exports = HookMap;
