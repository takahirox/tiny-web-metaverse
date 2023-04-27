import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mode = 'development';

export default [
  {
    devtool: 'source-map',
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
    name: "@tiny-web-metaverse/state_client",
    output: {
      filename: 'state_client.bundle.js',
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
    name: "@tiny-web-metaverse/state_client_examples",
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
