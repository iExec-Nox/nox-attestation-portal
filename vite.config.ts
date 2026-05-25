import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

function cvmProxyPlugin(): Plugin {
  return {
    name: 'cvm-proxy',
    configureServer(server) {
      server.middlewares.use('/api/cvm-proxy', async (req, res) => {
        try {
          // req.url = '/host:port/path' → 'https:/' + '/host:port/path' = 'https://host:port/path'
          const upstream = await fetch(`https:/${req.url}`)
          const body = await upstream.arrayBuffer()
          res.writeHead(upstream.status, {
            'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
          })
          res.end(Buffer.from(body))
        } catch {
          res.writeHead(502)
          res.end('Proxy error')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cvmProxyPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/cvms': {
        target: 'https://nox-cvms-exporter.ovh-tdx-dev.noxprotocol.dev:8443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/phala': {
        target: 'https://cloud-api.phala.network',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/phala/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
