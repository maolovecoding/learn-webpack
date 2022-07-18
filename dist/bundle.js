(() => {
  var modules = {
    "./src/common.js": (module) => {
      module.exports = {
        name: "zs",
        age: 22,
        friends: ["ls", "zl"],
      };
    },
  };
  var cache = {};
  function require(moduleId) {
    var cachedModule = cache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId](module, module.exports, require);
    return module.exports;
  }
  (() => {
    // 取模块的默认导出内容 如果是es模块 就直接取default然后做成getter 如果是commonjs形式 也做成getter的形式 返回模块本身
    require.n = (module) => {
      var getter =
        // es的默认导出已经是getter了
        module && module.__esModule ? () => module["default"] : () => module;
      // getter的a属性就是getter函数的返回值？？？
      // 也就是说：我们不执行getter 直接通过 getter.a 也能拿到结果
      // 为什么是 a ？ emmm 好像无所谓吧
      require.d(getter, { a: getter });
      return getter;
    };
  })();
  (() => {
    require.d = (exports, definition) => {
      for (var key in definition) {
        if (require.o(definition, key) && !require.o(exports, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
        }
      }
    };
  })();
  (() => {
    require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  })();
  (() => {
    require.r = (exports) => {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(exports, "__esModule", { value: true });
    };
  })();
  var exports = {};
  (() => {
    "use strict";
    // 只要打包前的模块是一个 es module 就会调用 r方法进行处理 这里index就是es
    require.r(exports);
    var _common_0__ = require("./src/common.js");
    var _common_0___default = /*#__PURE__*/ require.n(_common_0__);
    console.log(
      _common_0___default(),
      // 通过 a 属性就可以拿到default返回值
      _common_0___default.a,
      _common_0__.name,
      _common_0__.age,
      _common_0__.friends
    );
  })();
})();
