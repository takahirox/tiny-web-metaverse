const path = require('path');

const mode = 'development';

module.exports = [
  {
    devServer: {
      // TODO: Fix me. Can be a security hole.
      allowedHosts: 'all',
      client: {
        progress: true
      },
      host: '0.0.0.0',
      port: 8080,
      static: {
        directory: path.join(__dirname),
      }
    },
    devtool: 'source-map',
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