// Build both halves of the plugin with esbuild.
//
// The host half is ordinary ESM with every bare import left external.
//
// The browser half must be the DSH Loader's lazy-CJS *factory* artifact:
// executing the file only registers a factory, and the module body runs at
// materialization. No published preset produces this shape for a package
// outside the harness repository, so we reproduce it here — the wrapper below
// is byte-compatible with the shipped `@deepseek-ai/dsh-client-*` bundles
// (verified against dsh 0.1.1-rc.2's lib/client.js).

import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))

/**
 * Requests the browser shell answers from its frozen platform table or from a
 * dynamic package row. Anything else must be bundled in, because the Loader
 * resolves nothing outside that set. Derived from the request set of every
 * shipped client bundle.
 */
const CLIENT_EXTERNAL = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-runtime/client',
]

const shared = {
  bundle: true,
  target: 'es2022',
  legalComments: 'none',
  logLevel: 'info',
}

await build({
  ...shared,
  entryPoints: [join(root, 'src/index.ts')],
  outfile: join(root, 'lib/index.js'),
  format: 'esm',
  platform: 'node',
  packages: 'external',
})

await build({
  ...shared,
  entryPoints: [join(root, 'src/client/index.tsx')],
  outfile: join(root, 'lib/client.js'),
  format: 'cjs',
  platform: 'browser',
  jsx: 'automatic',
  external: CLIENT_EXTERNAL,
  banner: {
    js: `window.__ModuleLoader__.load({\n\tid: ${JSON.stringify(pkg.name)},\n\tfactory: (require) => {\nvar module = { exports: {} };\nvar exports = module.exports;\n`,
  },
  footer: { js: `\nreturn module.exports;\n\t}\n});\n` },
})

console.log('built lib/index.js + lib/client.js')
