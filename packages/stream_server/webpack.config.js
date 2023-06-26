const path = require('path');

const mode = 'development';

module.exports = [
  {
    devtool: false,
    entry: './src/index.ts',
    externals: {
      bufferutil: 'bufferutil',
      express: 'commonjs express',
      'utf-8-validate': 'utf-8-validate'
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
    name: "stream_server",
    output: {
      filename: 'stream_server.bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: [
        '.js',
        '.ts',
        '.tsx'
      ]
    },
    target: 'node'
  }
];