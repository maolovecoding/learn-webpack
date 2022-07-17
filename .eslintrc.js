module.exports = {
  root: true,
  parser: "babel-eslint",
  // 指定解析器选项
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2015,
  },
  // 脚本运行环境
  env: {
    browser: true,
  },
  // 规则 以及错误级别
  rules: {
    // 缩进
    indent: "off",
    // 引号类型
    quotes: "off",
    // 禁止使用console.log
    "no-console": "error",
  },
};
