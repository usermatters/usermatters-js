import fs from 'fs'
import { build } from 'esbuild'
import { rollup } from 'rollup'
import * as svelte from 'svelte/compiler'
import preprocess from 'svelte-preprocess'
import dts from 'rollup-plugin-dts'

const args = process.argv.slice(2)
const watch = args.includes('--watch')

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
    watch,
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
            let content = await fs.promises.readFile(args.path, 'utf8')
            content = await svelte
              .preprocess(
                content,
                preprocess({
                  postcss: true,
                }),
                {
                  filename: args.path,
                },
              )
              .then((res) => res.code)

            content = svelte.compile(content, {
              filename: args.path,
              css: false,
              customElement: true,
            }).js.code
            return { contents: content }
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
      input: './src/widget.ts',
      output: './dist/widget.dev.js',
      format: 'iife',
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

async function main() {
  if (!args.includes('--type-only')) {
    console.log(`Building library..`)
    await buildLibrary()
  }
  console.log(`Building types..`)
  await buildTypes()
}

main()
