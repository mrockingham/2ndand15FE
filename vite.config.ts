import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const sourceDirectory = fileURLToPath(new URL('./src', import.meta.url));

const publicSitemapPaths = [
  '/',
  '/games',
  '/news',
  '/players',
  '/players/compare',
  '/stats',
  '/standings',
  '/power-rankings',
  '/teams',
  '/ai',
  '/contact',
] as const;

const seoAssets = (): Plugin => {
  let siteOrigin: string | null = null;
  return {
    name: '2nd-and-15-seo-assets',
    configResolved(config) {
      const candidate = loadEnv(
        config.mode,
        process.cwd(),
        '',
      ).VITE_SITE_URL?.trim();
      if (!candidate) return;
      try {
        const parsed = new URL(candidate);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:')
          siteOrigin = parsed.origin;
      } catch {
        config.logger.warn(
          'VITE_SITE_URL is invalid; sitemap.xml will not be generated.',
        );
      }
    },
    generateBundle() {
      const sitemapLocation = siteOrigin
        ? `\nSitemap: ${siteOrigin}/sitemap.xml\n`
        : '\n';
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${sitemapLocation}`,
      });
      if (!siteOrigin) return;
      const urls = publicSitemapPaths
        .map(
          (route) =>
            `  <url><loc>${siteOrigin}${route === '/' ? '/' : route}</loc></url>`,
        )
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), seoAssets()],
  resolve: {
    alias: {
      '@': sourceDirectory,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: path.resolve('coverage'),
    },
  },
});
