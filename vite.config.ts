import svelte from 'rollup-plugin-svelte'
import { defineConfig } from 'vite'
import execa from 'execa'
import svelteConfig from './svelte.config'

let started = false

export default defineConfig({
  plugins: [
    svelte(svelteConfig),
    {
      name: 'build',
      async buildStart() {
        if (started) return
        started = true
        const cmd = execa('npm', ['run', 'build', '--', '--watch'])
        cmd.stdout?.pipe(process.stdout)
        cmd.stderr?.pipe(process.stderr)
      },
    },
  ],
})
