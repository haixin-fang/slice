import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import es3 from "rollup-plugin-es3";
import { uglify } from "rollup-plugin-uglify";
const ts = typescript({
  module: "es2015",
  target: "es3",
  lib: ["es2015", "dom"],
  exclude: "node_modules/**",
  sourceMap: true,
});
export default [
  {
    input: "./src/index.ts",
    output: {
      dir: "dist",
      format: "cjs",
      name: "slice",
      entryFileNames: "slice.cjs.js",
      sourcemap: true,
    },
    plugins: [es3({ sourcemap: true }), resolve(), commonjs(), ts],
  },
  {
    input: "./src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      name: "slice",
      entryFileNames: "slice.esm.js",sourcemap: true,
    },
    plugins: [es3({ sourcemap: true }), resolve(), commonjs(), ts],
  },
  {
    input: "src/index.ts",
    plugins: [es3({ sourcemap: true }), resolve(), commonjs(), ts],
    output: {
      dir: "dist",
      format: "umd",
      name: "slice",
      entryFileNames: "slice.js",
      sourcemap: true,
    },
  },
  {
    input: "src/index.ts",
    plugins: [es3({ sourcemap: true }), uglify(), resolve(), commonjs(), ts],
    output: {
      dir: "dist",
      format: "umd",
      name: "slice",
      entryFileNames: "slice.min.js",
      sourcemap: true,
    },
  },
];
