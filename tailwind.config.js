const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: 'jit',
  purge: isProd
    ? ['./src/**/*.svelte']
    : ['./index.html', './demos/**/*.{ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      ringWidth: {
        3: '3px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
