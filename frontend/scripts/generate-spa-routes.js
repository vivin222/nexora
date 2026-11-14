import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (fs.existsSync(distDir)) {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

    // 1. Primary Fallback 404.html for static hosting platforms
    fs.writeFileSync(path.join(distDir, '404.html'), indexHtml, 'utf-8');

    // 2. Pre-generate physical directory routes for SPA direct navigation
    const routes = ['admin', 'admin/login', 'dashboard', 'onboarding'];
    for (const route of routes) {
      const routeDir = path.join(distDir, route);
      fs.mkdirSync(routeDir, { recursive: true });
      fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml, 'utf-8');
    }

    console.log('[SPA Route Generator] Successfully generated 404.html and static route entries for: admin, admin/login, dashboard, onboarding');
  }
}
