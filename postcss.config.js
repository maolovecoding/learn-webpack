const postcssPresetEnv = require("postcss-preset-env");
module.exports = {
  plugins: [
    postcssPresetEnv({
      // 支持最新的五个版本
      browsers: "last 5 version",
    }),
  ],
};
