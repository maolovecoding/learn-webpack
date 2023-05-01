const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    publicPath: 'http://localhost:3000/',
    clean: true
  },
  devServer: {
    port: 3000
  },
  module: {
    rules: [
        {
            test: /\.jsx?$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ["@babel/preset-react"]
                },
            },
            exclude: /node_modules/,
        },
    ]
},
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    // ModuleFederationPlugin 配置模块联邦插件
    new ModuleFederationPlugin({
      filename: 'remoteEntry.js', // 本项目作为远程项目 对主机提供的服务的文件名
      name: 'remote', // 对外的名字 全局 var remote了
      exposes: {
        './List': './src/List', // 被远程引用时可暴露的资源路径及其别名
      },
      // remotes: {
      //   remote: 'host@http://localhost:8000/remoteEntry.js'
      // },
      // shared: {
      //   react: {
      //     singleton: true
      //   },
      //   'react-dom': '^18.2.0'
      // }
    })
  ],
  resolve: {
    extensions: ['.jsx', '.js','.ts']
  }
}