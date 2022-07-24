function loader(source) {
  console.log("inline2  ......");
  return source + "//inline2 loader";
}
module.exports = loader;
