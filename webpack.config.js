const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    'yolo': './src/index.ts',
  },
  node: {
    fs: 'empty'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'YOLO',
    umdNamedDefine: true
  },
  externals: {
    "@tensorflow/tfjs": "tf"
},
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'source-map',

  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader',
      exclude: /node_modules/,
      query: {
        declaration: false,
      }
    }]
  }
}