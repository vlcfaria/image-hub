import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      //Proxies for development
      '/api': {
        target: 'http://backend:42069',
        changeOrigin: true,
        rewrite: (path) => path, // <-- This passes the path through as-is
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Vite Proxy -> Forwarding request to:', options.target + proxyReq.path);
          });
        }
      },

      '/static/images': {
        target: 'http://backend:42069',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  }
})
