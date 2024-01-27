import typescript from 'rollup-plugin-typescript2';
import cleanup from 'rollup-plugin-cleanup';
import externalGlobals from "rollup-plugin-external-globals";

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    cleanup({ comments: 'none', extensions: ['.ts'] }), 
    typescript(),
    externalGlobals({
      "cheerio": "Cheerio"
    })
  ],
  context: 'this',
};
