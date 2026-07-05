import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  trailingSlash: 'always',  site: 'https://fraisdenotaire-calcul.fr',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
