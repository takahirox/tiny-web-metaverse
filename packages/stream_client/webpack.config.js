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
    name: "stream_client",
    output: {
      filename: 'stream_client.bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ]
    }
  },
  {
    devtool: false,
    entry: './examples/index.ts',
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
    name: "stream_client_examples",
    output: {
      filename: 'app.bundle.js',
      path: path.resolve(__dirname, 'examples', 'build')
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