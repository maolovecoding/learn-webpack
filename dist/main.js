(() => {
  var modules = {
    "./src/index.js": () => {
      eval(
        'console.log("debugger")\n\n//# sourceURL=webpack://learn-webpack/./src/index.js?'
      );
    },
  };
  var exports = {};
  modules["./src/index.js"]();
})();
