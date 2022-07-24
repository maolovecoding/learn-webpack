function loader(source) {
  console.log("inline2  ......");
  return source + "//inline2 loader";
}
// 配置pitch
loader.pitch = function () {
  console.log("inline 2 pitch !!!");
  // return "inline 2 return !!!"
};
module.exports = loader;
