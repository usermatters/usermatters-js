import { build } from 'esbuild'
import svelte from 'rollup-plugin-svelte'
import { rollup } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'

const bundle = async ({
  input,
  output,
  format,
  minify,
}: {
  input: string
  output: string
  format: 'iife' | 'cjs' | 'esm'
  minify?: boolean
}) => {
  const constants: Record<string, string> = {}
  if (format === 'iife') {
    constants['process.env.NODE_ENV'] = JSON.stringify(process.env.NODE_ENV)
  }
  await build({
    entryPoints: [input],
    format,
    outfile: output,
    bundle: true,
    define: constants,
    minify,
    plugins: [
      {
        name: 'svelte',
        setup(build) {
          if (format !== 'iife') {
            // Must not start with "/" or "./" or "../"
            const NON_NODE_MODULE_RE = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/

            build.onResolve({ filter: NON_NODE_MODULE_RE }, (args) => ({
              path: args.path,
              external: true,
            }))
          }

          build.onLoad({ filter: /\.svelte$/ }, async (args) => {
            const r = await rollup({
              input: [args.path],
              plugins: [nodeResolve(), svelte(require('./svelte.config'))],
            })
            const { output } = await r.generate({
              file: __dirname + '/out.js',
              format: 'esm',
            })
            return { contents: output[0].code }
          })
        },
      },
    ],
  })
}

const buildLibrary = async () => {
  Promise.all([
    bundle({
      input: './src/widget.ts',
      output: './dist/widget.js',
      format: 'iife',
      minify: true,
    }),
    bundle({
      input: './src/index.ts',
      output: './dist/index.cjs.js',
      format: 'cjs',
    }),
    bundle({
      input: './src/index.ts',
      output: './dist/index.esm.js',
      format: 'esm',
    }),
  ])
}

async function buildTypes() {
  const r = await rollup({
    input: ['./src/index.ts'],
    plugins: [dts()],
  })
  await r.write({
    format: 'esm',
    dir: './dist',
  })
}

const args = process.argv.slice(2)

async function main() {
  if (!args.includes('--type-only')) {
    console.log(`Building library..`)
    await buildLibrary()
  }
  console.log(`Building types..`)
  await buildTypes()
}

main()
