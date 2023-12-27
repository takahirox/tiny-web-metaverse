const path = require('path');
const webpack = require('webpack');

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
    name: "demo",
    output: {
      filename: 'demo.bundle.js',
      path: path.resolve(__dirname, 'dist'),
      // I don't know why but this seems to be needed if import "@gradio/client"
      publicPath: '/'
    },
    // Workaround for "node:buffer" that seems to be imported
    // via "@gradio/client"
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    ],
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ],
      // These fallbacks are for "@gradio/client"
      fallback: {
        buffer: false,
        crypto: false,
        http: false,
        https: false,
        net: false,
        stream: false,
        url: false,
        tls: false,
        zlib: false
      }
    }
  }
];