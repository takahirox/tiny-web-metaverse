const path = require('path');

const mode = 'development';

module.exports = [
  {
    devtool: false,
    entry: './src/index.ts',
    mode: mode,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    name: "main",
    output: {
      filename: 'client.bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ]
    }
  }
];