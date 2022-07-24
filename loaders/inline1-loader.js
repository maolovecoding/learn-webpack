function loader(source) {
  console.log("inline1  ......");
  return source + "//inline1 loader";
}
module.exports = loader;
