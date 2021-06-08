const { transform } = require('esbuild')

module.exports = {
  emitCss: false,
  compilerOptions: {
    customElement: true,
  },
  preprocess: require('svelte-preprocess')({
    postcss: true,
    async typescript({ content }) {
      const { code, map } = await transform(content, {
        loader: 'ts',
      })
      return { code, map }
    },
  }),
}
