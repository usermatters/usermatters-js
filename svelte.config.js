const { transform } = require('sucrase')

module.exports = {
  emitCss: false,
  compilerOptions: {
    customElement: true,
  },
  preprocess: require('svelte-preprocess')({
    postcss: true,
    typescript({ content }) {
      const { code } = transform(content, {
        transforms: ['typescript'],
      })
      return { code }
    },
  }),
}
