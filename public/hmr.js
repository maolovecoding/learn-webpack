(() => {
  var webpackModules = {
    "./src/index.js": (module, exports, require) => {
      const render = () => {
        const title = webpackRequire("./src/title.js");
        document.getElementById('root').innerText = title;
      };
      render();
    },
    "./src/title.js": (module, exports, require) => {
      module.exports = 'title21';
    }
  };
  var webpackModuleCache = {};
  function webpackRequire(moduleId) {
    var cachedModule = webpackModuleCache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = webpackModuleCache[moduleId] = {
      exports: {}
    };
    webpackModules[moduleId](module, module.exports, webpackRequire);
    return module.exports;
  }
  var webpackExports = {};
  webpackRequire("./src/index.js")
})();