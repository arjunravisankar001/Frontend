import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all interfaces so the browser can reach the dev server via your LAN IP
    host: true,
    // Keep Vite on its own port (your gateway is already using 8100)
    port: 5173,
    strictPort: true,
    // Tell the HMR client to use your public address instead of localhost,
    // and the public port exposed by your gateway.
    hmr: {
      protocol: 'ws', // change to 'wss' if your gateway serves HTTPS
      host: '25.7.141.58',
      clientPort: 8100,
      // port: 5173, // uncomment if you need to force the internal HMR server port
    },
  },
})
