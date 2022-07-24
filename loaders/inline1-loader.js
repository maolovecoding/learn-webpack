function loader(source) {
  console.log("inline1  ......");
  return source + "//inline1 loader";
}
// 配置pitch
loader.pitch = function () {
  console.log("inline 1 pitch !!!");
};
module.exports = loader;
