const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

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
      filename: 'tiny-web-metaverse-client.bundle.js',
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
    devtool: false,
    entry: './examples/apps/app.ts',
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
      path: path.resolve(__dirname, 'examples', 'dist')
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
    entry: './webrtc_server/src/index.ts',
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
    name: "webrtc_server",
    output: {
      filename: 'webrtc_server.bundle.js',
      path: path.resolve(__dirname, 'webrtc_server', 'dist')
    },
    plugins: [
      new NodePolyfillPlugin()
    ],
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ],
      fallback: {
        async_hooks: false,
        fs: false,
        net: false
      }
    }
  }
];