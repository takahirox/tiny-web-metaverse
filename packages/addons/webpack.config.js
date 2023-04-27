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
    name: "@tiny-web-metaverse/addons",
    output: {
      filename: 'addons.bundle.js',
      library: {
        type: "module",
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
  }
];