import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Maranza Sim',
        short_name: 'MaranzaSim',
        start_url: '.',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        description: 'Simulatore Maranza, versione PWA.',
        icons: [
          {
            src: '/generated-icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/generated-icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});