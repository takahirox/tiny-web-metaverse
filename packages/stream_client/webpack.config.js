const path = require('path');

const mode = 'development';

module.exports = [
  {
    devtool: false,
    entry: './src/index.ts',
    experiments: {
      outputModule: true,
    },
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
    name: "@tiny-web-metaverse/stream_client",
    output: {
      filename: 'stream_client.bundle.js',
      library: {
        type: "module"
      },
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
    devServer: {
      client: {
        progress: true
      },
      port: 8080,
      static: {
        directory: path.join(__dirname, 'examples'),
      }
    },
    devtool: 'source-map',
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
    name: "@tiny-web-metaverse/stream_client_examples",
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