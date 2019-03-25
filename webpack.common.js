const path = require('path')

module.exports = {
  entry: {
    'yolo': './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'YOLO',
    umdNamedDefine: true
  },
  node: {
    fs: 'empty'
  },
  externals: {
    "@tensorflow/tfjs": "tf"
  },
  resolve: {
    extensions: ['.ts',  '.js', '.tsx']
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
    },
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'tslint-loader',
      options: {
        // /* Loader options go here */
        // // tslint errors are displayed by default as warnings
        // // set emitErrors to true to display them as errors
        // emitErrors: false,

        // // tslint does not interrupt the compilation by default
        // // if you want any file with tslint errors to fail
        // // set failOnHint to true
        // failOnHint: false,
      }
    },
    ]
  }
}