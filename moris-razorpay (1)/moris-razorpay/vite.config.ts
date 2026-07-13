import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        // Never reload the page when the server writes to its JSON databases or uploads.
        // Without this, every order placement triggers a Vite full-page reload which
        // wipes React state and kills the order-success invoice screen.
        ignored: [
          '**/orders_db.json',
          '**/emails_db.json',
          '**/whatsapp_db.json',
          '**/otp_db.json',
          '**/newsletter_db.json',
          '**/admin_config.json',
          '**/public/uploads/**',
        ],
      },
    },
  };
});

