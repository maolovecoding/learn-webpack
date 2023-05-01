const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    publicPath: 'http://localhost:8000/',
    clean: true
  },
  devServer: {
    port: 8000
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
    new ModuleFederationPlugin({
      // filename: 'remoteEntry.js',
      // name: 'host', 
      remotes: {
        'remote': 'remote@http://localhost:3000/remoteEntry.js',
      },
      // exposes: {
      //   './Sliders': './src/Sliders'
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