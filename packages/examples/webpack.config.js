const path = require('path');

const mode = 'development';

module.exports = [
  {
    devServer: {
      client: {
        progress: true
      },
      port: 8080,
      static: {
        directory: path.join(__dirname),
      }
    },
    devtool: false,
    entry: './apps/app.ts',
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
    name: "examples",
    output: {
      filename: 'example.bundle.js',
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