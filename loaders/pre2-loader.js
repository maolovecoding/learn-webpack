function loader(source) {
  console.log("pre2  ......");
  return source + "//pre2 loader";
}
loader.pitch = function () {
  console.log("pre2 pitch !!!");
};
module.exports = loader;
